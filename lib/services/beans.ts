import { supabase } from '@/lib/supabase';

/**
 * Coffee Bean Database Service
 * 
 * Handles all database operations for coffee beans including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Inventory management
 * - Freshness tracking
 * - User-scoped data access with RLS
 */

// Bean database row structure matching Supabase schema
export interface Bean {
  id: string;
  user_id: string;
  
  // Basic Info
  name: string;
  origin: string;
  farm?: string;
  region?: string;
  altitude?: number;
  process: 'washed' | 'natural' | 'honey' | 'pulped-natural' | 'semi-washed' | 
          'white-honey' | 'yellow-honey' | 'red-honey' | 'black-honey' |
          'wet-hulled' | 'anaerobic' | 'carbonic-maceration' | 
          'extended-fermentation' | 'other';
  variety?: string;

  // Purchase & Inventory
  purchase_date: string; // ISO date string
  roast_date: string; // ISO date string
  supplier: string;
  cost: number; // decimal
  total_grams: number;
  remaining_grams: number;

  // Tasting & Rating
  roast_level: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
  tasting_notes?: string[];
  official_description?: string;
  my_notes?: string;
  rating?: number; // 1-5

  // System calculated fields (updated via database triggers)
  freshness_level?: number; // 1-5
  freshness_status?: 'too-fresh' | 'peak' | 'good' | 'declining' | 'stale';

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Input type for creating new beans
export interface BeanInput {
  // Basic Info
  name: string;
  origin: string;
  farm?: string;
  region?: string;
  altitude?: number;
  process: Bean['process'];
  variety?: string;

  // Purchase & Inventory
  purchase_date: string;
  roast_date: string;
  supplier: string;
  cost: number;
  total_grams: number;
  remaining_grams: number;

  // Tasting & Rating
  roast_level: Bean['roast_level'];
  tasting_notes?: string[];
  official_description?: string;
  my_notes?: string;
  rating?: number;
}

// Update type (all fields optional except id)
export interface BeanUpdate {
  id: string;
  name?: string;
  origin?: string;
  farm?: string;
  region?: string;
  altitude?: number;
  process?: Bean['process'];
  variety?: string;
  purchase_date?: string;
  roast_date?: string;
  supplier?: string;
  cost?: number;
  total_grams?: number;
  remaining_grams?: number;
  roast_level?: Bean['roast_level'];
  tasting_notes?: string[];
  official_description?: string;
  my_notes?: string;
  rating?: number;
}

// Service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Beans Database Service
 */
export class BeansService {
  
  /**
   * Get all beans for the current user
   */
  static async getAllBeans(): Promise<ServiceResponse<Bean[]>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get a single bean by ID
   */
  static async getBeanById(id: string): Promise<ServiceResponse<Bean>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Create a new bean
   */
  static async createBean(bean: BeanInput): Promise<ServiceResponse<Bean>> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false
        };
      }

      // Add user_id to bean data
      const beanWithUserId = {
        ...bean,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('beans')
        .insert(beanWithUserId)
        .select('*')
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Update an existing bean
   */
  static async updateBean(update: BeanUpdate): Promise<ServiceResponse<Bean>> {
    try {
      const { id, ...updateData } = update;
      
      const { data, error } = await supabase
        .from('beans')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Delete a bean by ID
   */
  static async deleteBean(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('beans')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Update bean inventory (remaining grams)
   */
  static async updateInventory(id: string, remainingGrams: number): Promise<ServiceResponse<Bean>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .update({ remaining_grams: remainingGrams })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get beans filtered by freshness status
   */
  static async getBeansByFreshness(status: Bean['freshness_status']): Promise<ServiceResponse<Bean[]>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .eq('freshness_status', status)
        .order('roast_date', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get beans with low inventory (customizable threshold)
   */
  static async getBeansWithLowInventory(thresholdGrams = 50): Promise<ServiceResponse<Bean[]>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .lt('remaining_grams', thresholdGrams)
        .gt('remaining_grams', 0)
        .order('remaining_grams', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get beans by rating (high to low)
   */
  static async getBeansByRating(minRating = 1): Promise<ServiceResponse<Bean[]>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .gte('rating', minRating)
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Search beans by name or origin
   */
  static async searchBeans(query: string): Promise<ServiceResponse<Bean[]>> {
    try {
      const { data, error } = await supabase
        .from('beans')
        .select('*')
        .or(`name.ilike.%${query}%,origin.ilike.%${query}%,supplier.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }
}
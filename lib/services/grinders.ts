import { supabase } from '@/lib/supabase';

/**
 * Coffee Grinder Database Service
 * 
 * Handles all database operations for coffee grinders including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Settings management
 * - Usage tracking
 * - Maintenance tracking
 * - User-scoped data access with RLS
 */

// Settings structure for grinder configurations
export interface GrinderSetting {
  setting_number: number;
  description: string; // "V60 Light Roast"
  method: string; // "V60"
  bean_type: string; // "Light Ethiopian"
  notes?: string;
}

// Setting range configuration
export interface SettingRange {
  min: number;
  max: number;
  increment: number;
}

// Grinder database row structure matching Supabase schema
export interface Grinder {
  id: string;
  user_id: string;
  
  // Basic Info
  name: string;
  brand: string;
  model: string;
  type: 'electric' | 'manual';
  burr_type?: 'conical' | 'flat' | 'ghost';
  burr_material?: 'steel' | 'ceramic' | 'titanium-coated';
  microns_per_step?: number; // Optional: microns movement per adjustment

  // Settings & Configuration
  settings?: GrinderSetting[]; // JSONB array of settings
  default_setting?: number;
  setting_range?: SettingRange; // JSONB object

  // Maintenance
  last_cleaned?: string; // ISO date string
  cleaning_frequency?: number; // days

  // Usage tracking
  total_uses: number;
  last_used?: string; // ISO timestamp string

  notes?: string;
  is_default: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Input type for creating new grinders
export interface GrinderInput {
  // Basic Info
  name: string;
  brand: string;
  model: string;
  type: Grinder['type'];
  burr_type?: Grinder['burr_type'];
  burr_material?: Grinder['burr_material'];
  microns_per_step?: number;

  // Settings & Configuration
  settings?: GrinderSetting[];
  default_setting?: number;
  setting_range?: SettingRange;

  // Maintenance
  last_cleaned?: string;
  cleaning_frequency?: number;

  notes?: string;
  is_default?: boolean;
}

// Update type (all fields optional except id)
export interface GrinderUpdate {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
  type?: Grinder['type'];
  burr_type?: Grinder['burr_type'];
  burr_material?: Grinder['burr_material'];
  microns_per_step?: number;
  settings?: GrinderSetting[];
  default_setting?: number;
  setting_range?: SettingRange;
  last_cleaned?: string;
  cleaning_frequency?: number;
  total_uses?: number;
  last_used?: string;
  notes?: string;
  is_default?: boolean;
}

// Service response type (reusing from beans service)
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Grinders Database Service
 */
export class GrindersService {
  
  /**
   * Get all grinders for the current user
   */
  static async getAllGrinders(): Promise<ServiceResponse<Grinder[]>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .select('*')
        .order('is_default', { ascending: false })
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
   * Get a single grinder by ID
   */
  static async getGrinderById(id: string): Promise<ServiceResponse<Grinder>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
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
   * Create a new grinder
   */
  static async createGrinder(grinder: GrinderInput): Promise<ServiceResponse<Grinder>> {
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

      // Add user_id to grinder data
      const grinderWithUserId = {
        ...grinder,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('grinders')
        .insert(grinderWithUserId)
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
   * Update an existing grinder
   */
  static async updateGrinder(update: GrinderUpdate): Promise<ServiceResponse<Grinder>> {
    try {
      const { id, ...updateData } = update;
      
      const { data, error } = await supabase
        .from('grinders')
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
   * Delete a grinder by ID
   */
  static async deleteGrinder(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('grinders')
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
   * Set a grinder as default (unsets other defaults)
   */
  static async setDefaultGrinder(id: string): Promise<ServiceResponse<Grinder>> {
    try {
      // First, unset all other defaults
      await supabase
        .from('grinders')
        .update({ is_default: false })
        .neq('id', id);

      // Then set this one as default
      const { data, error } = await supabase
        .from('grinders')
        .update({ is_default: true })
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
   * Get the default grinder
   */
  static async getDefaultGrinder(): Promise<ServiceResponse<Grinder>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .select('*')
        .eq('is_default', true)
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
   * Record grinder usage (increment total uses and update last used)
   */
  static async recordUsage(id: string): Promise<ServiceResponse<Grinder>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .rpc('increment_grinder_usage', { grinder_id: id });

      if (error) {
        // If RPC doesn't exist, use manual update
        const { data: current, error: fetchError } = await supabase
          .from('grinders')
          .select('total_uses')
          .eq('id', id)
          .single();

        if (fetchError) {
          return {
            data: null,
            error: fetchError.message,
            success: false
          };
        }

        const { data: updated, error: updateError } = await supabase
          .from('grinders')
          .update({
            total_uses: (current.total_uses || 0) + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', id)
          .select('*')
          .single();

        if (updateError) {
          return {
            data: null,
            error: updateError.message,
            success: false
          };
        }

        return {
          data: updated,
          error: null,
          success: true
        };
      }

      return {
        data: data,
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
   * Get grinders that need cleaning (based on cleaning frequency)
   */
  static async getGrindersNeedingCleaning(): Promise<ServiceResponse<Grinder[]>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .select('*')
        .not('cleaning_frequency', 'is', null)
        .not('last_cleaned', 'is', null)
        .order('last_cleaned', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      // Filter for grinders that actually need cleaning
      const now = new Date();
      const needsCleaning = (data || []).filter(grinder => {
        if (!grinder.last_cleaned || !grinder.cleaning_frequency) return false;
        
        const lastCleaned = new Date(grinder.last_cleaned);
        const daysSinceClean = Math.floor((now.getTime() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysSinceClean >= grinder.cleaning_frequency;
      });

      return {
        data: needsCleaning,
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
   * Update grinder settings
   */
  static async updateSettings(id: string, settings: GrinderSetting[]): Promise<ServiceResponse<Grinder>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .update({ settings })
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
   * Search grinders by name, brand, or model
   */
  static async searchGrinders(query: string): Promise<ServiceResponse<Grinder[]>> {
    try {
      const { data, error } = await supabase
        .from('grinders')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
        .order('is_default', { ascending: false })
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
import { supabase } from '@/lib/supabase';

/**
 * Brewer Database Service
 * 
 * Handles brewing equipment management (V60, Chemex, AeroPress, etc.)
 * Tracks equipment specifications and brewing parameters
 */

export interface Brewer {
  id: string;
  user_id: string;
  
  // Basic Info
  name: string;
  brand: string;
  model: string;
  type: 'pour-over' | 'immersion' | 'espresso' | 'cold-brew' | 'siphon' | 'percolator' | 'turkish' | 'moka';
  
  // General Specifications (optional)
  capacity_ml?: number;
  material?: string;
  filter_type?: string;
  
  // Espresso-specific fields (only for espresso type)
  espresso_specs?: any; // JSONB
  
  // Notes
  notes?: string;
  brewing_tips?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BrewerInput {
  name: string;
  brand: string;
  model: string;
  type: Brewer['type'];
  capacity_ml?: number;
  material?: string;
  filter_type?: string;
  espresso_specs?: any;
  notes?: string;
}

export interface BrewerUpdate {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
  type?: Brewer['type'];
  capacity_ml?: number;
  material?: string;
  filter_type?: string;
  espresso_specs?: any;
  notes?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class BrewersService {
  
  /**
   * Get all brewers for the current user
   */
  static async getAllBrewers(): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
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
   * Get a single brewer by ID
   */
  static async getBrewerById(id: string): Promise<ServiceResponse<Brewer>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
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
   * Create a new brewer
   */
  static async createBrewer(brewer: BrewerInput): Promise<ServiceResponse<Brewer>> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Authentication error:', userError);
        return {
          data: null,
          error: 'User not authenticated',
          success: false
        };
      }

      console.log('Authenticated user:', user.id);

      // Add user_id to brewer data
      const brewerWithUserId = {
        ...brewer,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('brewers')
        .insert(brewerWithUserId)
        .select('*')
        .single();

      if (error) {
        console.error('Brewer creation error:', error);
        console.error('User ID:', user.id);
        console.error('Brewer data being inserted:', brewerWithUserId);
        return {
          data: null,
          error: `Failed to create brewer: ${error.message}`,
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
   * Update an existing brewer
   */
  static async updateBrewer(update: BrewerUpdate): Promise<ServiceResponse<Brewer>> {
    try {
      const { id, ...updateData } = update;
      
      const { data, error } = await supabase
        .from('brewers')
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
   * Delete a brewer by ID
   */
  static async deleteBrewer(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('brewers')
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
   * Get brewers by type
   */
  static async getBrewersByType(type: Brewer['type']): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .eq('type', type)
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
   * Search brewers by name, brand, or model
   */
  static async searchBrewers(query: string): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%,notes.ilike.%${query}%`)
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
   * Create default brewer templates for new users
   */
  static async createDefaultBrewers(): Promise<ServiceResponse<Brewer[]>> {
    const defaultBrewers: BrewerInput[] = [
      {
        name: "Hario V60 Size 02",
        brand: "Hario",
        model: "V60-02",
        type: 'pour-over',
        material: 'ceramic',
        filter_type: "V60-02 Paper",
        capacity_ml: 500,
        notes: "Classic pour-over dripper. Use circular pouring motion and 30g bloom for 30 seconds."
      },
      {
        name: "Chemex Classic 6-Cup",
        brand: "Chemex",
        model: "Classic",
        type: 'pour-over',
        material: 'glass',
        filter_type: "Chemex Square",
        capacity_ml: 900,
        notes: "Use medium-coarse grind. Pour slowly and evenly. Thick filters provide clean cup."
      },
      {
        name: "AeroPress Original",
        brand: "AeroPress",
        model: "Original",
        type: 'immersion',
        material: 'plastic',
        filter_type: "AeroPress Paper",
        capacity_ml: 250,
        notes: "Try inverted method for more control. Experiment with steeping time. Medium-fine grind works best."
      }
    ];

    try {
      const createdBrewers: Brewer[] = [];
      
      for (const brewer of defaultBrewers) {
        const result = await this.createBrewer(brewer);
        if (result.success && result.data) {
          createdBrewers.push(result.data);
        }
      }

      return {
        data: createdBrewers,
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
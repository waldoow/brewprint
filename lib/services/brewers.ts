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
  type: 'v60' | 'chemex' | 'french-press' | 'aeropress' | 'espresso' | 
        'cold-brew' | 'siphon' | 'percolator' | 'turkish' | 'moka' | 'clever' | 
        'kalita-wave' | 'origami' | 'orea' | 'april' | 'other';
  brand?: string;
  model?: string;
  size?: string; // "01", "02", "6-cup", "350ml", etc.
  
  // Physical Characteristics
  material?: 'ceramic' | 'plastic' | 'glass' | 'metal' | 'wood' | 'other';
  filter_type?: string; // "V60 02", "Chemex", "Metal", "Paper", etc.
  capacity_ml?: number; // Total capacity in ml
  
  // Brewing Parameters
  optimal_dose_range?: [number, number]; // [min, max] in grams
  optimal_ratio_range?: [number, number]; // [min, max] ratio (1:15 to 1:17 = [15, 17])
  optimal_temp_range?: [number, number]; // [min, max] in Celsius
  optimal_grind_range?: [number, number]; // [min, max] grind setting
  
  // Usage & Care
  purchase_date?: string; // ISO date
  purchase_price?: number;
  maintenance_schedule?: string; // "weekly", "monthly", etc.
  last_maintenance?: string; // ISO date
  maintenance_notes?: string;
  
  // Status
  is_active: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'needs-replacement';
  location?: string; // "Kitchen", "Office", "Travel Kit"
  
  // Notes
  notes?: string;
  brewing_tips?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BrewerInput {
  name: string;
  type: Brewer['type'];
  brand?: string;
  model?: string;
  size?: string;
  material?: Brewer['material'];
  filter_type?: string;
  capacity_ml?: number;
  optimal_dose_range?: [number, number];
  optimal_ratio_range?: [number, number];
  optimal_temp_range?: [number, number];
  optimal_grind_range?: [number, number];
  purchase_date?: string;
  purchase_price?: number;
  maintenance_schedule?: string;
  last_maintenance?: string;
  maintenance_notes?: string;
  is_active?: boolean;
  condition?: Brewer['condition'];
  location?: string;
  notes?: string;
  brewing_tips?: string[];
}

export interface BrewerUpdate {
  id: string;
  name?: string;
  type?: Brewer['type'];
  brand?: string;
  model?: string;
  size?: string;
  material?: Brewer['material'];
  filter_type?: string;
  capacity_ml?: number;
  optimal_dose_range?: [number, number];
  optimal_ratio_range?: [number, number];
  optimal_temp_range?: [number, number];
  optimal_grind_range?: [number, number];
  purchase_date?: string;
  purchase_price?: number;
  maintenance_schedule?: string;
  last_maintenance?: string;
  maintenance_notes?: string;
  is_active?: boolean;
  condition?: Brewer['condition'];
  location?: string;
  notes?: string;
  brewing_tips?: string[];
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
        .order('is_active', { ascending: false })
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
      const { data, error } = await supabase
        .from('brewers')
        .insert({
          ...brewer,
          is_active: brewer.is_active !== undefined ? brewer.is_active : true,
          condition: brewer.condition || 'excellent'
        })
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
   * Get active brewers only
   */
  static async getActiveBrewers(): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .eq('is_active', true)
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
   * Get brewers by type
   */
  static async getBrewersByType(type: Brewer['type']): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .eq('type', type)
        .order('is_active', { ascending: false })
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
        .order('is_active', { ascending: false })
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
   * Record maintenance for a brewer
   */
  static async recordMaintenance(
    id: string, 
    maintenanceNotes: string,
    maintenanceDate?: string
  ): Promise<ServiceResponse<Brewer>> {
    try {
      const maintenanceISODate = maintenanceDate || new Date().toISOString();
      
      const { data, error } = await supabase
        .from('brewers')
        .update({
          last_maintenance: maintenanceISODate,
          maintenance_notes: maintenanceNotes
        })
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
   * Get brewers needing maintenance
   */
  static async getBrewersNeedingMaintenance(): Promise<ServiceResponse<Brewer[]>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .eq('is_active', true)
        .or(`last_maintenance.is.null,last_maintenance.lt.${thirtyDaysAgo.toISOString()}`)
        .not('maintenance_schedule', 'is', null)
        .order('last_maintenance', { ascending: true, nullsFirst: true });

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
   * Get brewers by condition
   */
  static async getBrewersByCondition(condition: Brewer['condition']): Promise<ServiceResponse<Brewer[]>> {
    try {
      const { data, error } = await supabase
        .from('brewers')
        .select('*')
        .eq('condition', condition)
        .order('updated_at', { ascending: false });

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
   * Update brewer condition
   */
  static async updateBrewerCondition(
    id: string, 
    condition: Brewer['condition'],
    notes?: string
  ): Promise<ServiceResponse<Brewer>> {
    const updateData: Partial<Brewer> = { condition };
    if (notes) {
      updateData.notes = notes;
    }

    return this.updateBrewer({ id, ...updateData });
  }

  /**
   * Activate/deactivate brewer
   */
  static async toggleBrewerStatus(id: string, isActive: boolean): Promise<ServiceResponse<Brewer>> {
    return this.updateBrewer({ id, is_active: isActive });
  }

  /**
   * Create default brewer templates for new users
   */
  static async createDefaultBrewers(): Promise<ServiceResponse<Brewer[]>> {
    const defaultBrewers: BrewerInput[] = [
      {
        name: "Hario V60 Size 02",
        type: 'v60',
        brand: "Hario",
        model: "V60-02",
        size: "02",
        material: 'ceramic',
        filter_type: "V60-02 Paper",
        capacity_ml: 500,
        optimal_dose_range: [15, 30],
        optimal_ratio_range: [15, 17],
        optimal_temp_range: [88, 96],
        condition: 'excellent',
        is_active: true,
        brewing_tips: [
          "Use circular pouring motion",
          "Start with 30g bloom for 30 seconds",
          "Maintain steady pour rate"
        ]
      },
      {
        name: "Chemex Classic 6-Cup",
        type: 'chemex',
        brand: "Chemex",
        model: "Classic",
        size: "6-cup",
        material: 'glass',
        filter_type: "Chemex Square",
        capacity_ml: 900,
        optimal_dose_range: [30, 50],
        optimal_ratio_range: [14, 16],
        optimal_temp_range: [90, 96],
        condition: 'excellent',
        is_active: true,
        brewing_tips: [
          "Use medium-coarse grind",
          "Pour slowly and evenly",
          "Thick filters provide clean cup"
        ]
      },
      {
        name: "AeroPress Original",
        type: 'aeropress',
        brand: "AeroPress",
        model: "Original",
        size: "Standard",
        material: 'plastic',
        filter_type: "AeroPress Paper",
        capacity_ml: 250,
        optimal_dose_range: [14, 18],
        optimal_ratio_range: [13, 15],
        optimal_temp_range: [80, 92],
        condition: 'excellent',
        is_active: true,
        brewing_tips: [
          "Try inverted method for more control",
          "Experiment with steeping time",
          "Medium-fine grind works best"
        ]
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
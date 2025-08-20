import { supabase } from '@/lib/supabase';

/**
 * Water Profile Database Service
 * 
 * Handles water profile management for coffee brewing
 * Water chemistry significantly impacts extraction and taste
 */

export interface WaterProfile {
  id: string;
  user_id: string;
  
  // Basic Info
  name: string;
  description?: string;
  is_default: boolean;
  
  // Water Chemistry (mg/L or ppm)
  hardness: number; // Total hardness (CaCO3 equivalent)
  calcium: number; // Ca2+
  magnesium: number; // Mg2+
  sodium: number; // Na+
  chloride: number; // Cl-
  sulfate: number; // SO4-
  bicarbonate: number; // HCO3-
  ph: number; // pH level
  tds: number; // Total Dissolved Solids
  
  // Source & Treatment
  source: 'tap' | 'filtered' | 'bottled' | 'distilled' | 'remineralized';
  filtration?: string; // Description of filtration method
  treatment_notes?: string;
  
  // Usage
  recommended_for?: string[]; // brewing methods this works well for
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface WaterProfileInput {
  name: string;
  description?: string;
  is_default?: boolean;
  hardness: number;
  calcium: number;
  magnesium: number;
  sodium: number;
  chloride: number;
  sulfate: number;
  bicarbonate: number;
  ph: number;
  tds: number;
  source: WaterProfile['source'];
  filtration?: string;
  treatment_notes?: string;
  recommended_for?: string[];
  notes?: string;
}

export interface WaterProfileUpdate {
  id: string;
  name?: string;
  description?: string;
  is_default?: boolean;
  hardness?: number;
  calcium?: number;
  magnesium?: number;
  sodium?: number;
  chloride?: number;
  sulfate?: number;
  bicarbonate?: number;
  ph?: number;
  tds?: number;
  source?: WaterProfile['source'];
  filtration?: string;
  treatment_notes?: string;
  recommended_for?: string[];
  notes?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class WaterProfilesService {
  
  /**
   * Get all water profiles for the current user
   */
  static async getAllWaterProfiles(): Promise<ServiceResponse<WaterProfile[]>> {
    try {
      const { data, error } = await supabase
        .from('water_profiles')
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
   * Get a single water profile by ID
   */
  static async getWaterProfileById(id: string): Promise<ServiceResponse<WaterProfile>> {
    try {
      const { data, error } = await supabase
        .from('water_profiles')
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
   * Create a new water profile
   */
  static async createWaterProfile(profile: WaterProfileInput): Promise<ServiceResponse<WaterProfile>> {
    try {
      // If this is set as default, unset all other defaults first
      if (profile.is_default) {
        await this.unsetAllDefaults();
      }

      const { data, error } = await supabase
        .from('water_profiles')
        .insert({
          ...profile,
          is_default: profile.is_default || false
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
   * Update an existing water profile
   */
  static async updateWaterProfile(update: WaterProfileUpdate): Promise<ServiceResponse<WaterProfile>> {
    try {
      const { id, ...updateData } = update;

      // If setting as default, unset all other defaults first
      if (updateData.is_default) {
        await this.unsetAllDefaults();
      }
      
      const { data, error } = await supabase
        .from('water_profiles')
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
   * Delete a water profile by ID
   */
  static async deleteWaterProfile(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('water_profiles')
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
   * Get the default water profile
   */
  static async getDefaultWaterProfile(): Promise<ServiceResponse<WaterProfile>> {
    try {
      const { data, error } = await supabase
        .from('water_profiles')
        .select('*')
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || null,
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
   * Set a water profile as default
   */
  static async setAsDefault(id: string): Promise<ServiceResponse<WaterProfile>> {
    return this.updateWaterProfile({ id, is_default: true });
  }

  /**
   * Unset all defaults (helper method)
   */
  private static async unsetAllDefaults(): Promise<void> {
    await supabase
      .from('water_profiles')
      .update({ is_default: false })
      .eq('is_default', true);
  }

  /**
   * Get water profiles by source type
   */
  static async getWaterProfilesBySource(source: WaterProfile['source']): Promise<ServiceResponse<WaterProfile[]>> {
    try {
      const { data, error } = await supabase
        .from('water_profiles')
        .select('*')
        .eq('source', source)
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
   * Search water profiles by name
   */
  static async searchWaterProfiles(query: string): Promise<ServiceResponse<WaterProfile[]>> {
    try {
      const { data, error } = await supabase
        .from('water_profiles')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,notes.ilike.%${query}%`)
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
   * Create default water profile templates for new users
   */
  static async createDefaultProfiles(): Promise<ServiceResponse<WaterProfile[]>> {
    const defaultProfiles: WaterProfileInput[] = [
      {
        name: "SCA Standard",
        description: "Specialty Coffee Association recommended water standard",
        is_default: true,
        hardness: 150,
        calcium: 68,
        magnesium: 24,
        sodium: 10,
        chloride: 40,
        sulfate: 96,
        bicarbonate: 40,
        ph: 7.0,
        tds: 150,
        source: 'filtered',
        recommended_for: ['v60', 'chemex', 'aeropress', 'french-press'],
        notes: "Balanced water profile suitable for most brewing methods"
      },
      {
        name: "Soft Water",
        description: "Low mineral content for delicate coffees",
        hardness: 75,
        calcium: 34,
        magnesium: 12,
        sodium: 5,
        chloride: 20,
        sulfate: 48,
        bicarbonate: 20,
        ph: 6.8,
        tds: 75,
        source: 'filtered',
        recommended_for: ['v60', 'chemex'],
        notes: "Great for light roasts and highlighting floral notes"
      },
      {
        name: "Hard Water",
        description: "Higher mineral content for fuller body",
        hardness: 300,
        calcium: 136,
        magnesium: 48,
        sodium: 20,
        chloride: 80,
        sulfate: 192,
        bicarbonate: 80,
        ph: 7.2,
        tds: 300,
        source: 'tap',
        recommended_for: ['french-press', 'espresso'],
        notes: "Enhances body and mouthfeel, good for dark roasts"
      }
    ];

    try {
      const createdProfiles: WaterProfile[] = [];
      
      for (const profile of defaultProfiles) {
        const result = await this.createWaterProfile(profile);
        if (result.success && result.data) {
          createdProfiles.push(result.data);
        }
      }

      return {
        data: createdProfiles,
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
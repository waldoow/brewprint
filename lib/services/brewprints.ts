import { supabase } from '@/lib/supabase';

/**
 * Brewprint Database Service
 * 
 * Handles all database operations for brewprints including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Experimentation workflow management
 * - Versioning and recipe iterations
 * - User-scoped data access with RLS
 */

// Brewprint database row structure matching Supabase schema
export interface Brewprint {
  id: string;
  user_id: string;
  
  // Basic Info
  name: string;
  description?: string;
  method: 'v60' | 'chemex' | 'french-press' | 'aeropress' | 'espresso' | 
         'cold-brew' | 'siphon' | 'percolator' | 'turkish' | 'moka';
  difficulty: 1 | 2 | 3; // 1=Easy, 2=Intermediate, 3=Advanced

  // Equipment References (optional - can be generic templates)
  bean_id?: string;
  grinder_id?: string;
  brewer_id?: string;
  water_profile_id?: string;

  // Target Parameters (what you plan to do)
  parameters: BrewParameters;

  // Target Metrics (what you're aiming for)
  target_metrics?: TargetMetrics;

  // Brewing Steps
  steps: BrewStep[];

  // Actual Brewing Results (what happened when you tested this)
  actual_parameters?: ActualParameters;
  actual_metrics?: ActualMetrics;
  rating?: number; // 1-5
  tasting_notes?: string[];
  brewing_notes?: string;
  brew_date?: string; // ISO date string
  status: 'experimenting' | 'final' | 'archived';

  // Versioning (flexible tree structure)
  parent_id?: string;
  version: string; // Default 'v1'
  version_notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Target Parameters JSONB structure
export interface BrewParameters {
  coffee_grams: number;
  water_grams: number;
  water_temp: number; // Celsius
  grind_setting?: number;
  bloom_time?: number; // seconds
  total_time?: number; // seconds
  ratio?: string; // e.g., "1:16"
}

// Target Metrics JSONB structure
export interface TargetMetrics {
  target_tds?: number; // Total Dissolved Solids (%)
  target_extraction?: number; // Extraction rate (%)
  target_strength?: number; // Strength (mg/ml)
  target_time?: number; // Target brew time (seconds)
}

// Brewing Steps JSONB structure
export interface BrewStep {
  id: number;
  order: number;
  title: string; // "Bloom", "First Pour"
  description: string; // "Pour 50g water in circular motion"
  duration: number; // seconds
  water_amount: number; // grams for this step
  technique: string; // "circular", "center-pour", "agitate"
  temperature?: number; // if different from main temp
}

// Actual Parameters JSONB structure (what you actually used)
export interface ActualParameters {
  coffee_grams: number;
  water_grams: number;
  grind_setting?: number;
  water_temp: number;
  bloom_time?: number;
  total_time?: number;
}

// Actual Metrics JSONB structure (what you measured)
export interface ActualMetrics {
  tds?: number; // Measured Total Dissolved Solids (%)
  extraction_yield?: number; // Calculated extraction rate (%)
  brew_strength?: number; // Measured strength (mg/ml)
  refractometer_reading?: number; // Direct refractometer value
  final_volume?: number; // ml of final brew
  water_retained?: number; // grams retained in coffee grounds
}

// Input type for creating new brewprints
export interface BrewprintInput {
  name: string;
  description?: string;
  method: Brewprint['method'];
  difficulty: Brewprint['difficulty'];
  bean_id?: string;
  grinder_id?: string;
  brewer_id?: string;
  water_profile_id?: string;
  parameters: BrewParameters;
  target_metrics?: TargetMetrics;
  steps: BrewStep[];
  parent_id?: string;
  version?: string;
  version_notes?: string;
}

// Update type (all fields optional except id)
export interface BrewprintUpdate {
  id: string;
  name?: string;
  description?: string;
  method?: Brewprint['method'];
  difficulty?: Brewprint['difficulty'];
  bean_id?: string;
  grinder_id?: string;
  brewer_id?: string;
  water_profile_id?: string;
  parameters?: BrewParameters;
  target_metrics?: TargetMetrics;
  steps?: BrewStep[];
  actual_parameters?: ActualParameters;
  actual_metrics?: ActualMetrics;
  rating?: number;
  tasting_notes?: string[];
  brewing_notes?: string;
  brew_date?: string;
  status?: Brewprint['status'];
  version_notes?: string;
}

// Result recording type
export interface BrewResult {
  actual_parameters: ActualParameters;
  actual_metrics?: ActualMetrics;
  rating: number;
  tasting_notes?: string[];
  brewing_notes?: string;
  brew_date: string;
}

// Service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Brewprints Database Service
 */
export class BrewprintsService {
  
  /**
   * Get all brewprints for the current user
   */
  static async getAllBrewprints(): Promise<ServiceResponse<Brewprint[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
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
   * Get a single brewprint by ID
   */
  static async getBrewprintById(id: string): Promise<ServiceResponse<Brewprint>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
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
   * Create a new brewprint
   */
  static async createBrewprint(brewprint: BrewprintInput): Promise<ServiceResponse<Brewprint>> {
    try {
      // Set default version if not provided
      const brewprintData = {
        ...brewprint,
        version: brewprint.version || 'v1',
        status: 'experimenting' as const
      };

      const { data, error } = await supabase
        .from('brewprints')
        .insert(brewprintData)
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
   * Update an existing brewprint
   */
  static async updateBrewprint(update: BrewprintUpdate): Promise<ServiceResponse<Brewprint>> {
    try {
      const { id, ...updateData } = update;
      
      const { data, error } = await supabase
        .from('brewprints')
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
   * Delete a brewprint by ID
   */
  static async deleteBrewprint(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('brewprints')
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
   * Record brewing results for a brewprint experiment
   */
  static async recordBrewResult(id: string, result: BrewResult): Promise<ServiceResponse<Brewprint>> {
    try {
      // Automatically determine status based on rating
      const status = result.rating >= 4 ? 'final' : 'experimenting';
      
      const { data, error } = await supabase
        .from('brewprints')
        .update({
          actual_parameters: result.actual_parameters,
          actual_metrics: result.actual_metrics,
          rating: result.rating,
          tasting_notes: result.tasting_notes,
          brewing_notes: result.brewing_notes,
          brew_date: result.brew_date,
          status
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
   * Get brewprints filtered by status
   */
  static async getBrewprintsByStatus(status: Brewprint['status']): Promise<ServiceResponse<Brewprint[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
        .select('*')
        .eq('status', status)
        .order('brew_date', { ascending: false, nullsFirst: false })
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
   * Get brewprints by brewing method
   */
  static async getBrewprintsByMethod(method: Brewprint['method']): Promise<ServiceResponse<Brewprint[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
        .select('*')
        .eq('method', method)
        .order('rating', { ascending: false, nullsFirst: false })
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
   * Get brewprints by rating (high to low)
   */
  static async getBrewprintsByRating(minRating = 1): Promise<ServiceResponse<Brewprint[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
        .select('*')
        .gte('rating', minRating)
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .order('brew_date', { ascending: false, nullsFirst: false });

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
   * Search brewprints by name or description
   */
  static async searchBrewprints(query: string): Promise<ServiceResponse<Brewprint[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
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
   * Get brewprint experimentation chain (parent and all children)
   */
  static async getExperimentationChain(parentId: string): Promise<ServiceResponse<Brewprint[]>> {
    try {
      // First get the parent
      const { data: parent, error: parentError } = await supabase
        .from('brewprints')
        .select('*')
        .eq('id', parentId)
        .single();

      if (parentError) {
        return {
          data: null,
          error: parentError.message,
          success: false
        };
      }

      // Then get all children
      const { data: children, error: childrenError } = await supabase
        .from('brewprints')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });

      if (childrenError) {
        return {
          data: null,
          error: childrenError.message,
          success: false
        };
      }

      const chain = [parent, ...(children || [])];

      return {
        data: chain,
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
   * Create new experiment iteration from existing brewprint
   */
  static async createExperimentIteration(
    parentId: string, 
    adjustments: Partial<BrewprintInput>
  ): Promise<ServiceResponse<Brewprint>> {
    try {
      // First get the parent brewprint
      const parentResult = await this.getBrewprintById(parentId);
      if (!parentResult.success || !parentResult.data) {
        return parentResult as ServiceResponse<Brewprint>;
      }

      const parent = parentResult.data;

      // Generate next version number
      const nextVersion = this.generateNextVersion(parent.version);

      // Create new experiment with adjustments
      const newExperiment: BrewprintInput = {
        name: adjustments.name || `${parent.name} (${nextVersion})`,
        description: adjustments.description || parent.description,
        method: adjustments.method || parent.method,
        difficulty: adjustments.difficulty || parent.difficulty,
        bean_id: adjustments.bean_id || parent.bean_id,
        grinder_id: adjustments.grinder_id || parent.grinder_id,
        brewer_id: adjustments.brewer_id || parent.brewer_id,
        water_profile_id: adjustments.water_profile_id || parent.water_profile_id,
        parameters: adjustments.parameters || parent.parameters,
        target_metrics: adjustments.target_metrics || parent.target_metrics,
        steps: adjustments.steps || parent.steps,
        parent_id: parentId,
        version: nextVersion,
        version_notes: adjustments.version_notes
      };

      return await this.createBrewprint(newExperiment);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Generate next version number (simple increment)
   */
  private static generateNextVersion(currentVersion: string): string {
    const match = currentVersion.match(/^v(\d+)$/);
    if (match) {
      const versionNumber = parseInt(match[1], 10);
      return `v${versionNumber + 1}`;
    }
    return 'v2'; // fallback if version format is unexpected
  }

  /**
   * Get final recipes (status = 'final') ordered by rating
   */
  static async getFinalRecipes(): Promise<ServiceResponse<Brewprint[]>> {
    return this.getBrewprintsByStatus('final');
  }

  /**
   * Get active experiments (status = 'experimenting')
   */
  static async getActiveExperiments(): Promise<ServiceResponse<Brewprint[]>> {
    return this.getBrewprintsByStatus('experimenting');
  }

  /**
   * Archive a brewprint (set status to 'archived')
   */
  static async archiveBrewprint(id: string): Promise<ServiceResponse<Brewprint>> {
    return this.updateBrewprint({
      id,
      status: 'archived'
    });
  }

  /**
   * Mark experiment as final recipe
   */
  static async markAsFinal(id: string): Promise<ServiceResponse<Brewprint>> {
    return this.updateBrewprint({
      id,
      status: 'final'
    });
  }
}
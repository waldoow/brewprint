import { supabase } from '@/lib/supabase';
import type { Bean } from './beans';
import type { Grinder } from './grinders';
import type { Brewer } from './brewers';
import type { WaterProfile } from './water-profiles';
import type { Brewprint } from './brewprints';
import type { Folder, Tag } from './folders';

/**
 * Data Export/Import Service
 * 
 * Handles backup, export, and import of user data
 * Supports multiple formats: JSON, CSV, and structured backup
 */

export interface ExportData {
  metadata: {
    version: string;
    exported_at: string;
    user_id: string;
    total_items: number;
  };
  beans: Bean[];
  grinders: Grinder[];
  brewers: Brewer[];
  water_profiles: WaterProfile[];
  brewprints: Brewprint[];
  folders: Folder[];
  tags: Tag[];
  folder_brewprints: Array<{
    folder_id: string;
    brewprint_id: string;
    added_at: string;
  }>;
  brewprints_tags: Array<{
    brewprint_id: string;
    tag_name: string;
    created_at: string;
  }>;
}

export interface ImportResult {
  success: boolean;
  imported_counts: {
    beans: number;
    grinders: number;
    brewers: number;
    water_profiles: number;
    brewprints: number;
    folders: number;
    tags: number;
  };
  errors: string[];
  warnings: string[];
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class ExportService {

  /**
   * Export all user data as structured JSON
   */
  static async exportAllData(): Promise<ServiceResponse<ExportData>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          data: null,
          error: 'User authentication required',
          success: false
        };
      }

      // Fetch all user data in parallel
      const [
        beansResult,
        grindersResult, 
        brewersResult,
        waterProfilesResult,
        brewprintsResult,
        foldersResult,
        tagsResult,
        folderBrewprintsResult,
        brewprintsTagsResult
      ] = await Promise.all([
        supabase.from('beans').select('*').order('created_at'),
        supabase.from('grinders').select('*').order('created_at'),
        supabase.from('brewers').select('*').order('created_at'),
        supabase.from('water_profiles').select('*').order('created_at'),
        supabase.from('brewprints').select('*').order('created_at'),
        supabase.from('folders').select('*').order('created_at'),
        supabase.from('tags').select('*').order('name'),
        supabase.from('folder_brewprints').select('*').order('added_at'),
        supabase.from('brewprints_tags').select('*').order('created_at')
      ]);

      // Check for errors
      const results = [
        beansResult, grindersResult, brewersResult, waterProfilesResult,
        brewprintsResult, foldersResult, tagsResult, folderBrewprintsResult, brewprintsTagsResult
      ];

      for (const result of results) {
        if (result.error) {
          return {
            data: null,
            error: result.error.message,
            success: false
          };
        }
      }

      const totalItems = results.reduce((sum, result) => sum + (result.data?.length || 0), 0);

      const exportData: ExportData = {
        metadata: {
          version: '1.0.0',
          exported_at: new Date().toISOString(),
          user_id: user.id,
          total_items: totalItems
        },
        beans: beansResult.data || [],
        grinders: grindersResult.data || [],
        brewers: brewersResult.data || [],
        water_profiles: waterProfilesResult.data || [],
        brewprints: brewprintsResult.data || [],
        folders: foldersResult.data || [],
        tags: tagsResult.data || [],
        folder_brewprints: folderBrewprintsResult.data || [],
        brewprints_tags: brewprintsTagsResult.data || []
      };

      return {
        data: exportData,
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
   * Export brewprints as CSV
   */
  static async exportBrewprintsCSV(): Promise<ServiceResponse<string>> {
    try {
      const { data: brewprints, error } = await supabase
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

      if (!brewprints || brewprints.length === 0) {
        return {
          data: 'No brewprints to export',
          error: null,
          success: true
        };
      }

      // CSV Headers
      const headers = [
        'Name',
        'Method',
        'Difficulty',
        'Coffee (g)',
        'Water (g)',
        'Temperature (°C)',
        'Grind Setting',
        'Total Time (s)',
        'Rating',
        'Status',
        'Brew Date',
        'Created Date'
      ];

      // Convert brewprints to CSV rows
      const rows = brewprints.map(brew => [
        `"${brew.name.replace(/"/g, '""')}"`,
        brew.method,
        brew.difficulty,
        brew.actual_parameters?.coffee_grams || brew.parameters?.coffee_grams || '',
        brew.actual_parameters?.water_grams || brew.parameters?.water_grams || '',
        brew.actual_parameters?.water_temp || brew.parameters?.water_temp || '',
        brew.actual_parameters?.grind_setting || brew.parameters?.grind_setting || '',
        brew.actual_parameters?.total_time || brew.parameters?.total_time || '',
        brew.rating || '',
        brew.status,
        brew.brew_date || '',
        brew.created_at
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      return {
        data: csv,
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
   * Export beans inventory as CSV
   */
  static async exportBeansCSV(): Promise<ServiceResponse<string>> {
    try {
      const { data: beans, error } = await supabase
        .from('beans')
        .select('*')
        .order('name');

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      if (!beans || beans.length === 0) {
        return {
          data: 'No beans to export',
          error: null,
          success: true
        };
      }

      // CSV Headers
      const headers = [
        'Name',
        'Roaster',
        'Origin',
        'Process',
        'Roast Level',
        'Weight (g)',
        'Price',
        'Roast Date',
        'Purchase Date',
        'Notes'
      ];

      // Convert beans to CSV rows
      const rows = beans.map(bean => [
        `"${bean.name.replace(/"/g, '""')}"`,
        `"${(bean.roaster || '').replace(/"/g, '""')}"`,
        `"${(bean.origin || '').replace(/"/g, '""')}"`,
        bean.process || '',
        bean.roast_level || '',
        bean.weight_grams || '',
        bean.price || '',
        bean.roast_date || '',
        bean.purchase_date || '',
        `"${(bean.notes || '').replace(/"/g, '""')}"`
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      return {
        data: csv,
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
   * Import data from exported JSON
   */
  static async importData(exportData: ExportData, options: {
    overwrite?: boolean;
    skipConflicts?: boolean;
  } = {}): Promise<ServiceResponse<ImportResult>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          data: null,
          error: 'User authentication required',
          success: false
        };
      }

      const result: ImportResult = {
        success: true,
        imported_counts: {
          beans: 0,
          grinders: 0,
          brewers: 0,
          water_profiles: 0,
          brewprints: 0,
          folders: 0,
          tags: 0
        },
        errors: [],
        warnings: []
      };

      // Validate data format
      if (!exportData.metadata || exportData.metadata.version !== '1.0.0') {
        result.errors.push('Invalid or unsupported data format');
        result.success = false;
        return { data: result, error: null, success: true };
      }

      // Import in order due to dependencies
      const importSteps = [
        { data: exportData.beans, table: 'beans', key: 'beans' as keyof ImportResult['imported_counts'] },
        { data: exportData.grinders, table: 'grinders', key: 'grinders' as keyof ImportResult['imported_counts'] },
        { data: exportData.brewers, table: 'brewers', key: 'brewers' as keyof ImportResult['imported_counts'] },
        { data: exportData.water_profiles, table: 'water_profiles', key: 'water_profiles' as keyof ImportResult['imported_counts'] },
        { data: exportData.folders, table: 'folders', key: 'folders' as keyof ImportResult['imported_counts'] },
        { data: exportData.tags, table: 'tags', key: 'tags' as keyof ImportResult['imported_counts'] },
        { data: exportData.brewprints, table: 'brewprints', key: 'brewprints' as keyof ImportResult['imported_counts'] }
      ];

      for (const step of importSteps) {
        if (!step.data || step.data.length === 0) continue;

        try {
          // Prepare data for import (remove user_id, let RLS handle it)
          const dataForImport = step.data.map(item => {
            const { user_id, created_at, updated_at, ...rest } = item;
            return rest;
          });

          if (options.overwrite) {
            // Delete existing data first
            await supabase.from(step.table).delete().neq('id', 'impossible-id');
          }

          const { data: imported, error } = await supabase
            .from(step.table)
            .insert(dataForImport)
            .select('id');

          if (error) {
            if (options.skipConflicts && error.message.includes('duplicate')) {
              result.warnings.push(`Skipped ${step.data.length} duplicate ${step.key} records`);
            } else {
              result.errors.push(`Failed to import ${step.key}: ${error.message}`);
              result.success = false;
            }
          } else {
            result.imported_counts[step.key] = imported?.length || 0;
          }
        } catch (error) {
          result.errors.push(`Error importing ${step.key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.success = false;
        }
      }

      // Import relationships if main data was successful
      if (result.success || options.skipConflicts) {
        // Import folder-brewprint relationships
        if (exportData.folder_brewprints && exportData.folder_brewprints.length > 0) {
          try {
            const { error } = await supabase
              .from('folder_brewprints')
              .insert(exportData.folder_brewprints);

            if (error && !options.skipConflicts) {
              result.warnings.push(`Some folder-brewprint relationships could not be imported: ${error.message}`);
            }
          } catch (error) {
            result.warnings.push('Failed to import folder relationships');
          }
        }

        // Import brewprint-tag relationships
        if (exportData.brewprints_tags && exportData.brewprints_tags.length > 0) {
          try {
            const { error } = await supabase
              .from('brewprints_tags')
              .insert(exportData.brewprints_tags);

            if (error && !options.skipConflicts) {
              result.warnings.push(`Some brewprint-tag relationships could not be imported: ${error.message}`);
            }
          } catch (error) {
            result.warnings.push('Failed to import tag relationships');
          }
        }
      }

      return {
        data: result,
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
   * Create a formatted backup filename
   */
  static generateBackupFilename(format: 'json' | 'csv' = 'json'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `brewprint-backup-${timestamp}.${format}`;
  }

  /**
   * Validate imported data structure
   */
  static validateExportData(data: any): data is ExportData {
    if (!data || typeof data !== 'object') return false;
    if (!data.metadata || !data.metadata.version) return false;
    
    const requiredFields = [
      'beans', 'grinders', 'brewers', 'water_profiles', 
      'brewprints', 'folders', 'tags'
    ];
    
    return requiredFields.every(field => Array.isArray(data[field]));
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<ServiceResponse<{
    total_items: number;
    tables: Record<string, number>;
    last_export?: string;
  }>> {
    try {
      const tables = [
        'beans', 'grinders', 'brewers', 'water_profiles',
        'brewprints', 'folders', 'tags'
      ];

      const counts: Record<string, number> = {};
      let totalItems = 0;

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          counts[table] = count || 0;
          totalItems += count || 0;
        }
      }

      return {
        data: {
          total_items: totalItems,
          tables: counts
        },
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
   * Clear all user data (for testing or reset purposes)
   */
  static async clearAllData(confirmationToken: string): Promise<ServiceResponse<boolean>> {
    if (confirmationToken !== 'CONFIRM_DELETE_ALL_DATA') {
      return {
        data: null,
        error: 'Invalid confirmation token',
        success: false
      };
    }

    try {
      const tables = [
        'brewprints_tags',
        'folder_brewprints', 
        'brewprints',
        'folders',
        'tags',
        'water_profiles',
        'brewers',
        'grinders',
        'beans'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 'impossible-id'); // Delete all user records (RLS handles user filtering)

        if (error) {
          return {
            data: null,
            error: `Failed to clear ${table}: ${error.message}`,
            success: false
          };
        }
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
}
import { supabase } from '@/lib/supabase';

/**
 * Folders and Tags Service
 * 
 * Handles organization of brewprints through folders and tags
 * Supports hierarchical folder structure and flexible tagging system
 */

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  parent_id?: string; // For nested folders
  color?: string; // Hex color code
  icon?: string; // Icon identifier
  is_default: boolean;
  brewprints_count: number; // Virtual field from join
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color?: string; // Hex color code
  usage_count: number; // Virtual field showing how many brewprints use this tag
  created_at: string;
  updated_at: string;
}

export interface FolderBrewprint {
  id: string;
  folder_id: string;
  brewprint_id: string;
  added_at: string;
}

export interface BrewprintTag {
  id: string;
  brewprint_id: string;
  tag_name: string;
  created_at: string;
}

export interface FolderInput {
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  is_default?: boolean;
}

export interface FolderUpdate {
  id: string;
  name?: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  is_default?: boolean;
}

export interface TagInput {
  name: string;
  color?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class FoldersService {

  /**
   * Get all folders for the current user with brewprint counts
   */
  static async getAllFolders(): Promise<ServiceResponse<Folder[]>> {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select(`
          *,
          folder_brewprints!left(count)
        `)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      // Process the joined data to get brewprints count
      const folders: Folder[] = (data || []).map(folder => ({
        ...folder,
        brewprints_count: folder.folder_brewprints?.[0]?.count || 0
      }));

      return {
        data: folders,
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
   * Get a single folder by ID
   */
  static async getFolderById(id: string): Promise<ServiceResponse<Folder>> {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select(`
          *,
          folder_brewprints!left(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const folder: Folder = {
        ...data,
        brewprints_count: data.folder_brewprints?.[0]?.count || 0
      };

      return {
        data: folder,
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
   * Create a new folder
   */
  static async createFolder(folder: FolderInput): Promise<ServiceResponse<Folder>> {
    try {
      // If this is set as default, unset other defaults
      if (folder.is_default) {
        await this.unsetAllDefaultFolders();
      }

      const { data, error } = await supabase
        .from('folders')
        .insert({
          ...folder,
          is_default: folder.is_default || false
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
        data: { ...data, brewprints_count: 0 },
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
   * Update an existing folder
   */
  static async updateFolder(update: FolderUpdate): Promise<ServiceResponse<Folder>> {
    try {
      const { id, ...updateData } = update;

      // If setting as default, unset other defaults
      if (updateData.is_default) {
        await this.unsetAllDefaultFolders();
      }

      const { data, error } = await supabase
        .from('folders')
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
        data: { ...data, brewprints_count: 0 }, // Count will be updated by caller if needed
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
   * Delete a folder by ID
   */
  static async deleteFolder(id: string): Promise<ServiceResponse<boolean>> {
    try {
      // First remove all brewprints from this folder
      await supabase
        .from('folder_brewprints')
        .delete()
        .eq('folder_id', id);

      // Then delete the folder
      const { error } = await supabase
        .from('folders')
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
   * Get the default folder
   */
  static async getDefaultFolder(): Promise<ServiceResponse<Folder>> {
    try {
      const { data, error } = await supabase
        .from('folders')
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
        data: data ? { ...data, brewprints_count: 0 } : null,
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
   * Set a folder as default
   */
  static async setAsDefault(id: string): Promise<ServiceResponse<Folder>> {
    return this.updateFolder({ id, is_default: true });
  }

  /**
   * Unset all default folders (helper method)
   */
  private static async unsetAllDefaultFolders(): Promise<void> {
    await supabase
      .from('folders')
      .update({ is_default: false })
      .eq('is_default', true);
  }

  /**
   * Add a brewprint to a folder
   */
  static async addBrewprintToFolder(folderId: string, brewprintId: string): Promise<ServiceResponse<FolderBrewprint>> {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('folder_brewprints')
        .select('*')
        .eq('folder_id', folderId)
        .eq('brewprint_id', brewprintId)
        .single();

      if (existing) {
        return {
          data: existing,
          error: null,
          success: true
        };
      }

      const { data, error } = await supabase
        .from('folder_brewprints')
        .insert({
          folder_id: folderId,
          brewprint_id: brewprintId
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
   * Remove a brewprint from a folder
   */
  static async removeBrewprintFromFolder(folderId: string, brewprintId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('folder_brewprints')
        .delete()
        .eq('folder_id', folderId)
        .eq('brewprint_id', brewprintId);

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
   * Get all brewprints in a folder
   */
  static async getBrewprintsInFolder(folderId: string): Promise<ServiceResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('folder_brewprints')
        .select('brewprint_id')
        .eq('folder_id', folderId)
        .order('added_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data || []).map(fb => fb.brewprint_id),
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
   * Get folders containing a specific brewprint
   */
  static async getFoldersForBrewprint(brewprintId: string): Promise<ServiceResponse<Folder[]>> {
    try {
      const { data, error } = await supabase
        .from('folder_brewprints')
        .select(`
          folder_id,
          folders!inner(*)
        `)
        .eq('brewprint_id', brewprintId);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const folders: Folder[] = (data || []).map(fb => ({
        ...fb.folders,
        brewprints_count: 0 // Count would need separate query
      }));

      return {
        data: folders,
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
   * Create default folders for new users
   */
  static async createDefaultFolders(): Promise<ServiceResponse<Folder[]>> {
    const defaultFolders: FolderInput[] = [
      {
        name: 'My Recipes',
        description: 'Your personal coffee recipes',
        is_default: true,
        color: '#6d28d9',
        icon: 'coffee'
      },
      {
        name: 'Experiments',
        description: 'Testing new brewing parameters',
        color: '#059669',
        icon: 'flask'
      },
      {
        name: 'Favorites',
        description: 'Your best coffee recipes',
        color: '#dc2626',
        icon: 'heart'
      }
    ];

    try {
      const createdFolders: Folder[] = [];

      for (const folder of defaultFolders) {
        const result = await this.createFolder(folder);
        if (result.success && result.data) {
          createdFolders.push(result.data);
        }
      }

      return {
        data: createdFolders,
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

export class TagsService {

  /**
   * Get all tags for the current user with usage counts
   */
  static async getAllTags(): Promise<ServiceResponse<Tag[]>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          brewprints_tags!left(count)
        `)
        .order('name', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      // Process the joined data to get usage count
      const tags: Tag[] = (data || []).map(tag => ({
        ...tag,
        usage_count: tag.brewprints_tags?.[0]?.count || 0
      }));

      return {
        data: tags,
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
   * Get a single tag by name
   */
  static async getTagByName(name: string): Promise<ServiceResponse<Tag>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: { ...data, usage_count: 0 }, // Usage count would need separate query
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
   * Create a new tag
   */
  static async createTag(tag: TagInput): Promise<ServiceResponse<Tag>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(tag)
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
        data: { ...data, usage_count: 0 },
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
   * Delete a tag by name
   */
  static async deleteTag(name: string): Promise<ServiceResponse<boolean>> {
    try {
      // First remove all references to this tag
      await supabase
        .from('brewprints_tags')
        .delete()
        .eq('tag_name', name);

      // Then delete the tag
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('name', name);

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
   * Add a tag to a brewprint
   */
  static async addTagToBrewprint(brewprintId: string, tagName: string): Promise<ServiceResponse<BrewprintTag>> {
    try {
      // First ensure the tag exists
      let tag = await this.getTagByName(tagName);
      if (!tag.success && tag.error?.includes('No rows returned')) {
        // Create the tag if it doesn't exist
        const createResult = await this.createTag({ name: tagName });
        if (!createResult.success) {
          return createResult as ServiceResponse<BrewprintTag>;
        }
      }

      // Check if the relationship already exists
      const { data: existing } = await supabase
        .from('brewprints_tags')
        .select('*')
        .eq('brewprint_id', brewprintId)
        .eq('tag_name', tagName)
        .single();

      if (existing) {
        return {
          data: existing,
          error: null,
          success: true
        };
      }

      // Create the relationship
      const { data, error } = await supabase
        .from('brewprints_tags')
        .insert({
          brewprint_id: brewprintId,
          tag_name: tagName
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
   * Remove a tag from a brewprint
   */
  static async removeTagFromBrewprint(brewprintId: string, tagName: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('brewprints_tags')
        .delete()
        .eq('brewprint_id', brewprintId)
        .eq('tag_name', tagName);

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
   * Get all tags for a specific brewprint
   */
  static async getTagsForBrewprint(brewprintId: string): Promise<ServiceResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints_tags')
        .select('tag_name')
        .eq('brewprint_id', brewprintId);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data || []).map(bt => bt.tag_name),
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
   * Get all brewprints with a specific tag
   */
  static async getBrewprintsWithTag(tagName: string): Promise<ServiceResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('brewprints_tags')
        .select('brewprint_id')
        .eq('tag_name', tagName)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: (data || []).map(bt => bt.brewprint_id),
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
   * Search tags by name
   */
  static async searchTags(query: string): Promise<ServiceResponse<Tag[]>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const tags: Tag[] = (data || []).map(tag => ({
        ...tag,
        usage_count: 0 // Usage count would need separate query
      }));

      return {
        data: tags,
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
   * Get popular tags (most used)
   */
  static async getPopularTags(limit = 10): Promise<ServiceResponse<Tag[]>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          brewprints_tags!left(count)
        `)
        .order('brewprints_tags.count', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const tags: Tag[] = (data || []).map(tag => ({
        ...tag,
        usage_count: tag.brewprints_tags?.[0]?.count || 0
      }));

      return {
        data: tags,
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
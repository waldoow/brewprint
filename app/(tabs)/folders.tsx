import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  FoldersService,
  TagsService,
  type Folder,
  type Tag,
} from '@/lib/services/folders';
import { toast } from 'sonner-native';

export default function FoldersScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const [foldersResult, tagsResult] = await Promise.all([
        FoldersService.getAllFolders(),
        TagsService.getAllTags(),
      ]);

      if (foldersResult.success && foldersResult.data) {
        setFolders(foldersResult.data);
      } else {
        toast.error('Failed to load folders');
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data);
      }
    } catch (error) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrganizationData();
    setRefreshing(false);
  };

  // Sort folders and tags for display
  const organizedData = useMemo(() => {
    // Sort folders by usage (default first, then by recipe count, then by name)
    const sortedFolders = folders.sort((a, b) => {
      if (a.is_default !== b.is_default) {
        return a.is_default ? -1 : 1;
      }
      if (a.brewprints_count !== b.brewprints_count) {
        return b.brewprints_count - a.brewprints_count;
      }
      return a.name.localeCompare(b.name);
    });

    // Sort tags by usage count
    const sortedTags = tags.sort((a, b) => {
      if (a.usage_count !== b.usage_count) {
        return b.usage_count - a.usage_count;
      }
      return a.name.localeCompare(b.name);
    });

    return { folders: sortedFolders, tags: sortedTags };
  }, [folders, tags]);

  const handleCreateFolder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.success('Folder creation coming soon');
  };

  const handleFolderPress = (folderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.success('Folder details coming soon');
  };

  const handleTagPress = (tagName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.success('Tag filtering coming soon');
  };

  if (loading) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader title="Organization" />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading organization data...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer 
      scrollable 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <ProfessionalHeader
        title="Organization"
        subtitle={`${organizedData.folders.length} folders • ${organizedData.tags.length} tags`}
        action={{
          title: 'New Folder',
          onPress: handleCreateFolder,
        }}
      />

      {/* Folders Section */}
      <View style={styles.sectionHeader}>
        <ProfessionalText variant="label" weight="semibold" color="secondary">
          FOLDERS
        </ProfessionalText>
        <ProfessionalText variant="caption" color="tertiary">
          {organizedData.folders.length}
        </ProfessionalText>
      </View>

      {organizedData.folders.length === 0 ? (
        <ProfessionalCard variant="outlined">
          <ProfessionalText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Create folders to organize your brewing recipes
          </ProfessionalText>
          <ProfessionalButton
            title="Create Your First Folder"
            onPress={handleCreateFolder}
            variant="primary"
            style={{ marginTop: 16 }}
            fullWidth
          />
        </ProfessionalCard>
      ) : (
        organizedData.folders.map((folder) => (
          <ProfessionalCard
            key={folder.id}
            variant="default"
            onPress={() => handleFolderPress(folder.id)}
          >
            <View style={styles.folderHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.folderTitleRow}>
                  <ProfessionalText variant="h4" weight="semibold">
                    {folder.name}
                  </ProfessionalText>
                  {folder.is_default && (
                    <View style={styles.defaultBadge}>
                      <ProfessionalText variant="caption" color="inverse">
                        DEFAULT
                      </ProfessionalText>
                    </View>
                  )}
                </View>
                {folder.description && (
                  <ProfessionalText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                    {folder.description}
                  </ProfessionalText>
                )}
              </View>
            </View>

            <View style={styles.folderStats}>
              <View style={styles.statItem}>
                <ProfessionalText variant="caption" color="secondary">
                  Recipes
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {folder.brewprints_count || 0}
                </ProfessionalText>
              </View>
              
              <View style={styles.statItem}>
                <ProfessionalText variant="caption" color="secondary">
                  Created
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {new Date(folder.created_at).toLocaleDateString()}
                </ProfessionalText>
              </View>
            </View>
          </ProfessionalCard>
        ))
      )}

      {/* Tags Section */}
      <View style={[styles.sectionHeader, { marginTop: 32 }]}>
        <ProfessionalText variant="label" weight="semibold" color="secondary">
          TAGS
        </ProfessionalText>
        <ProfessionalText variant="caption" color="tertiary">
          {organizedData.tags.length}
        </ProfessionalText>
      </View>

      {organizedData.tags.length === 0 ? (
        <ProfessionalCard variant="outlined">
          <ProfessionalText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Tags will appear automatically as you create recipes
          </ProfessionalText>
        </ProfessionalCard>
      ) : (
        <ProfessionalCard variant="outlined">
          <View style={styles.tagsGrid}>
            {organizedData.tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip, { backgroundColor: theme.colors.gray[100] }]}
                onPress={() => handleTagPress(tag.name)}
              >
                <ProfessionalText variant="caption" weight="medium">
                  #{tag.name}
                </ProfessionalText>
                <ProfessionalText variant="caption" color="secondary">
                  {tag.usage_count || 0}
                </ProfessionalText>
              </TouchableOpacity>
            ))}
          </View>
        </ProfessionalCard>
      )}
    </ProfessionalContainer>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  
  folderHeader: {
    marginBottom: 12,
  },
  
  folderTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  folderStats: {
    flexDirection: 'row' as const,
    gap: 24,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
  },
  
  statItem: {
    flex: 1,
    gap: 2,
  },
  
  tagsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  
  tagChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
};

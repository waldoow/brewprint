import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
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
      <Container>
        <PageHeader title="Organization" />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading organization data...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container 
      scrollable 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Section 
        title="Recipe Organization"
        subtitle={`Organize your brewing recipes with ${organizedData.folders.length} folders and ${organizedData.tags.length} tags`}
        spacing="xl"
      >
        <Button
          title="Create New Folder"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleCreateFolder}
        />
      </Section>

      <Section
        title={`Recipe Folders`}
        subtitle={`${organizedData.folders.length} folder${organizedData.folders.length === 1 ? '' : 's'} for organizing your recipes`}
        spacing="lg"
      >
        {organizedData.folders.length === 0 ? (
          <Card variant="outlined" style={{ alignItems: 'center', padding: 24 }}>
            <Text 
              variant="2xl" 
              weight="bold" 
              style={{ textAlign: 'center', marginBottom: 12 }}
            >
              📁
            </Text>
            <Text 
              variant="lg" 
              color="secondary" 
              style={{ textAlign: 'center', marginBottom: 32 }}
            >
              Create folders to organize your brewing recipes by style, beans, or methods
            </Text>
            <Button
              title="Create Your First Folder"
              onPress={handleCreateFolder}
              variant="primary"
              size="lg"
              fullWidth
            />
          </Card>
        ) : (
          organizedData.folders.map((folder) => (
            <Card
              key={folder.id}
              variant="default"
              onPress={() => handleFolderPress(folder.id)}
            >
              <View style={styles.folderHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.folderTitleRow}>
                    <Text variant="h4" weight="semibold">
                      {folder.name}
                    </Text>
                    {folder.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text variant="caption" color="inverse">
                          DEFAULT
                        </Text>
                      </View>
                    )}
                  </View>
                  {folder.description && (
                    <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
                      {folder.description}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.folderStats}>
                <View style={styles.statItem}>
                  <Text variant="caption" color="secondary">
                    Recipes
                  </Text>
                  <Text variant="caption" weight="medium">
                    {folder.brewprints_count || 0}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="caption" color="secondary">
                    Created
                  </Text>
                  <Text variant="caption" weight="medium">
                    {new Date(folder.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </Section>

      <Section
        title="Popular Tags"
        subtitle={`${organizedData.tags.length} tag${organizedData.tags.length === 1 ? '' : 's'} to filter and discover recipes`}
        spacing="xl"
      >
        {organizedData.tags.length === 0 ? (
          <Card variant="outlined" style={{ alignItems: 'center', padding: 24 }}>
            <Text 
              variant="2xl" 
              weight="bold" 
              style={{ textAlign: 'center', marginBottom: 12 }}
            >
              🏷️
            </Text>
            <Text 
              variant="lg" 
              color="secondary" 
              style={{ textAlign: 'center' }}
            >
              Tags will appear automatically as you create and categorize your recipes
            </Text>
          </Card>
        ) : (
          <Card variant="default">
            <View style={styles.tagsGrid}>
              {organizedData.tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.tagChip, { backgroundColor: theme.colors.gray[100] }]}
                  onPress={() => handleTagPress(tag.name)}
                >
                  <Text variant="caption" weight="medium">
                    #{tag.name}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {tag.usage_count || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      </Section>
    </Container>
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

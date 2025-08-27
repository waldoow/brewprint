import {
  FoldersService,
  TagsService,
  type Folder,
  type Tag,
} from "@/lib/services/folders";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from "sonner-native";

export default function FoldersScreen() {

  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const loadOrganizationData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [foldersResult, tagsResult] = await Promise.all([
        FoldersService.getAllFolders(),
        TagsService.getAllTags(),
      ]);

      if (foldersResult.success && foldersResult.data) {
        setFolders(foldersResult.data);
      } else {
        toast.error("Failed to load folders");
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data);
      }
    } catch {
      toast.error("Error loading organization data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  useFocusEffect(
    useCallback(() => {
      loadOrganizationData();
    }, [loadOrganizationData])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadOrganizationData();
  }, [loadOrganizationData]);

  // Organize and analyze data
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

  // Calculate organization statistics
  const organizationStats = useMemo(() => {
    const totalRecipes = folders.reduce(
      (sum, folder) => sum + (folder.brewprints_count || 0),
      0
    );
    const totalTagUsage = tags.reduce(
      (sum, tag) => sum + (tag.usage_count || 0),
      0
    );
    const defaultFolder = folders.find((folder) => folder.is_default);
    const mostPopularTag = tags.length > 0 ? tags[0] : null;

    return {
      totalFolders: folders.length,
      totalTags: tags.length,
      totalRecipes,
      totalTagUsage,
      defaultFolder,
      mostPopularTag,
      averageRecipesPerFolder:
        folders.length > 0 ? Math.round(totalRecipes / folders.length) : 0,
    };
  }, [folders, tags]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 64,
      paddingBottom: 24,
    },
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    pageSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 32,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 16,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    statDescription: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 18,
    },
    emptyButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    emptyButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    folderItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lastFolderItem: {
      borderBottomWidth: 0,
    },
    folderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    folderName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginRight: 8,
    },
    defaultBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      backgroundColor: theme.colors.success,
    },
    defaultBadgeText: {
      fontSize: 8,
      fontWeight: '600',
      color: theme.colors.text.inverse,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    folderDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 12,
      lineHeight: 16,
    },
    folderStats: {
      flexDirection: 'row',
      gap: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    folderStat: {
      minWidth: 60,
    },
    folderStatLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    folderStatValue: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    tagsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
    },
    tagsTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    tagsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagName: {
      fontSize: 12,
      color: theme.colors.text.primary,
      marginRight: 4,
    },
    tagCount: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    viewAllTags: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: 'center',
    },
    viewAllButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 4,
    },
    viewAllButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    insightsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
    },
    insightsTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    insightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    insightInfo: {
      flex: 1,
    },
    insightTag: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    insightDescription: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    browseButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 4,
    },
    browseButtonText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
  });

  const handleCreateFolder = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/folders/new');
  };

  const handleFolderPress = (folderId: string, folderName: string) => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toast.success(`Opening ${folderName} folder`);
  };

  const handleTagPress = (tagName: string) => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toast.success(`Filtering by #${tagName}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>
            Organization
          </Text>
          <Text style={styles.pageSubtitle}>
            Loading organization data...
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading folders and tags...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>
          Organization
        </Text>
        <Text style={styles.pageSubtitle}>
          {organizationStats.totalFolders} folders and {organizationStats.totalTags} tags organizing {organizationStats.totalRecipes} recipes
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateFolder}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                New Folder
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toast.success("Browse tags feature coming soon")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                Browse Tags
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Organization Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Organization Overview
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Folders</Text>
              <Text style={styles.statValue}>
                {organizationStats.totalFolders}
              </Text>
              <Text style={styles.statDescription}>
                Recipe collections
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Tags</Text>
              <Text style={styles.statValue}>
                {organizationStats.totalTags}
              </Text>
              <Text style={styles.statDescription}>
                Classification labels
              </Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Organized Recipes</Text>
              <Text style={styles.statValue}>
                {organizationStats.totalRecipes}
              </Text>
              <Text style={styles.statDescription}>
                In folders
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg per Folder</Text>
              <Text style={styles.statValue}>
                {organizationStats.averageRecipesPerFolder}
              </Text>
              <Text style={styles.statDescription}>
                Recipes/folder
              </Text>
            </View>
          </View>
        </View>

        {/* Folders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recipe Folders
          </Text>
          <Text style={styles.sectionSubtitle}>
            {organizedData.folders.length} folder{organizedData.folders.length === 1 ? "" : "s"} organizing your brewing collection
          </Text>
          
          {organizedData.folders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No Folders Yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Create folders to organize your brewing recipes by style, bean origin, or brewing method.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateFolder}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyButtonText}>
                  Create First Folder
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {organizedData.folders.map((folder, index) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderItem,
                    index === organizedData.folders.length - 1 && styles.lastFolderItem
                  ]}
                  onPress={() => handleFolderPress(folder.id, folder.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.folderHeader}>
                    <Text style={styles.folderName}>
                      {folder.name}
                    </Text>
                    {folder.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>
                          DEFAULT
                        </Text>
                      </View>
                    )}
                  </View>
                  {folder.description && (
                    <Text style={styles.folderDescription}>
                      {folder.description}
                    </Text>
                  )}

                  <View style={styles.folderStats}>
                    <View style={styles.folderStat}>
                      <Text style={styles.folderStatLabel}>Recipes</Text>
                      <Text style={styles.folderStatValue}>
                        {folder.brewprints_count || 0}
                      </Text>
                    </View>
                    <View style={styles.folderStat}>
                      <Text style={styles.folderStatLabel}>Created</Text>
                      <Text style={styles.folderStatValue}>
                        {new Date(folder.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year:
                            new Date(folder.created_at).getFullYear() !==
                            new Date().getFullYear()
                              ? "numeric"
                              : undefined,
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recipe Tags
          </Text>
          <Text style={styles.sectionSubtitle}>
            {organizedData.tags.length} tag{organizedData.tags.length === 1 ? "" : "s"} for filtering and discovery
          </Text>
          
          {organizedData.tags.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No Tags Yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Tags appear automatically as you create and categorize your brewing recipes. Use tags to filter by origin, roast level, or brewing method.
              </Text>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>
                Popular Tags
              </Text>
              <View style={styles.tagsGrid}>
                {organizedData.tags.slice(0, 12).map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={styles.tagItem}
                    onPress={() => handleTagPress(tag.name)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${tag.name} tag, used ${
                      tag.usage_count || 0
                    } times`}
                  >
                    <Text style={styles.tagName}>
                      #{tag.name}
                    </Text>
                    <Text style={styles.tagCount}>
                      {tag.usage_count || 0}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {organizedData.tags.length > 12 && (
                <View style={styles.viewAllTags}>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() =>
                      toast.success("View all tags feature coming soon")
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllButtonText}>
                      View All {organizedData.tags.length} Tags
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Organization Insights */}
        {organizationStats.mostPopularTag && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Organization Insights
            </Text>
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>
                Most Popular Tag
              </Text>
              <View style={styles.insightRow}>
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTag}>
                    #{organizationStats.mostPopularTag.name}
                  </Text>
                  <Text style={styles.insightDescription}>
                    Used {organizationStats.mostPopularTag.usage_count || 0} times
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() =>
                    handleTagPress(organizationStats.mostPopularTag!.name)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.browseButtonText}>
                    Browse
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

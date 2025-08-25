import { DataButton } from "@/components/ui/DataButton";
import { DataCard } from "@/components/ui/DataCard";
import { DataGrid, DataLayout, DataSection } from "@/components/ui/DataLayout";
import { DataText } from "@/components/ui/DataText";
import { DataMetric } from "@/components/ui/DataMetric";
import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  FoldersService,
  TagsService,
  type Folder,
  type Tag,
} from "@/lib/services/folders";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { toast } from "sonner-native";

export default function FoldersScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      <DataLayout title="Organization" subtitle="Loading organization data...">
        <DataCard>
          <DataText variant="body" color="secondary">
            Loading folders and tags...
          </DataText>
        </DataCard>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Organization"
      subtitle={`${organizationStats.totalFolders} folders and ${organizationStats.totalTags} tags organizing ${organizationStats.totalRecipes} recipes`}
      scrollable
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Quick Actions */}
      <DataSection title="Quick Actions" spacing="lg">
        <DataGrid columns={2} gap="sm">
          <DataButton
            title="New Folder"
            variant="primary"
            size="md"
            onPress={handleCreateFolder}
          />
          <DataButton
            title="Browse Tags"
            variant="secondary"
            size="md"
            onPress={() => toast.success("Browse tags feature coming soon")}
          />
        </DataGrid>
      </DataSection>

      {/* Organization Statistics */}
      <DataSection title="Organization Overview" spacing="lg">
        <DataGrid columns={2} gap="md">
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Total Folders
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {organizationStats.totalFolders}
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Recipe collections
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Total Tags
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {organizationStats.totalTags}
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Classification labels
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Organized Recipes
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {organizationStats.totalRecipes}
            </DataText>
            <DataText variant="tiny" color="tertiary">
              In folders
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Avg per Folder
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {organizationStats.averageRecipesPerFolder}
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Recipes/folder
            </DataText>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Folders Section */}
      <DataSection
        title="Recipe Folders"
        subtitle={`${organizedData.folders.length} folder${
          organizedData.folders.length === 1 ? "" : "s"
        } organizing your brewing collection`}
        spacing="lg"
      >
        {organizedData.folders.length === 0 ? (
          <DataCard
            title="No Folders Yet"
            message="Create folders to organize your brewing recipes by style, bean origin, or brewing method."
            action={{
              title: "Create First Folder",
              onPress: handleCreateFolder,
            }}
          />
        ) : (
          <DataGrid columns={1} gap="md">
            {organizedData.folders.map((folder) => (
              <DataCard
                key={folder.id}
                onPress={() => handleFolderPress(folder.id, folder.name)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: theme.spacing[3],
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: theme.spacing[2],
                        marginBottom: theme.spacing[1],
                      }}
                    >
                      <DataText variant="h4" color="primary" weight="semibold">
                        {folder.name}
                      </DataText>
                      {folder.is_default && (
                        <View
                          style={{
                            paddingHorizontal: theme.spacing[2],
                            paddingVertical: theme.spacing[1],
                            borderRadius: theme.layout.card.radius.sm,
                            backgroundColor: theme.colors.success,
                          }}
                        >
                          <DataText
                            variant="tiny"
                            color="inverse"
                            weight="medium"
                          >
                            DEFAULT
                          </DataText>
                        </View>
                      )}
                    </View>
                    {folder.description && (
                      <DataText variant="small" color="secondary">
                        {folder.description}
                      </DataText>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing[4],
                    paddingTop: theme.spacing[3],
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.borderLight,
                  }}
                >
                  <DataMetric
                    label="Recipes"
                    value={folder.brewprints_count || 0}
                    size="sm"
                  />
                  <DataMetric
                    label="Created"
                    value={new Date(folder.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year:
                          new Date(folder.created_at).getFullYear() !==
                          new Date().getFullYear()
                            ? "numeric"
                            : undefined,
                      }
                    )}
                    size="sm"
                  />
                </View>
              </DataCard>
            ))}
          </DataGrid>
        )}
      </DataSection>

      {/* Tags Section */}
      <DataSection
        title="Recipe Tags"
        subtitle={`${organizedData.tags.length} tag${
          organizedData.tags.length === 1 ? "" : "s"
        } for filtering and discovery`}
        spacing="lg"
      >
        {organizedData.tags.length === 0 ? (
          <DataCard
            title="No Tags Yet"
            message="Tags appear automatically as you create and categorize your brewing recipes. Use tags to filter by origin, roast level, or brewing method."
          />
        ) : (
          <DataCard>
            <DataText
              variant="h4"
              color="primary"
              weight="semibold"
              style={{ marginBottom: theme.spacing[4] }}
            >
              Popular Tags
            </DataText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing[2],
              }}
            >
              {organizedData.tags.slice(0, 12).map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing[1],
                    paddingHorizontal: theme.spacing[3],
                    paddingVertical: theme.spacing[2],
                    borderRadius: theme.layout.card.radius.md,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  onPress={() => handleTagPress(tag.name)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${tag.name} tag, used ${
                    tag.usage_count || 0
                  } times`}
                >
                  <DataText variant="small" weight="medium">
                    #{tag.name}
                  </DataText>
                  <DataText variant="tiny" color="secondary">
                    {tag.usage_count || 0}
                  </DataText>
                </TouchableOpacity>
              ))}
            </View>

            {organizedData.tags.length > 12 && (
              <View
                style={{
                  marginTop: theme.spacing[4],
                  paddingTop: theme.spacing[4],
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.borderLight,
                  alignItems: "center",
                }}
              >
                <DataButton
                  title={`View All ${organizedData.tags.length} Tags`}
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    toast.success("View all tags feature coming soon")
                  }
                />
              </View>
            )}
          </DataCard>
        )}
      </DataSection>

      {/* Organization Insights */}
      {organizationStats.mostPopularTag && (
        <DataSection title="Organization Insights" spacing="lg">
          <DataCard>
            <DataText
              variant="h4"
              color="primary"
              weight="semibold"
              style={{ marginBottom: theme.spacing[3] }}
            >
              Most Popular Tag
            </DataText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <DataText variant="body" weight="medium">
                  #{organizationStats.mostPopularTag.name}
                </DataText>
                <DataText variant="small" color="secondary">
                  Used {organizationStats.mostPopularTag.usage_count || 0} times
                </DataText>
              </View>
              <DataButton
                title="Browse"
                variant="secondary"
                size="sm"
                onPress={() =>
                  handleTagPress(organizationStats.mostPopularTag!.name)
                }
              />
            </View>
          </DataCard>
        </DataSection>
      )}

    </DataLayout>
  );
}

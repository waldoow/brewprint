import { Header } from "@/components/ui/Header";
import { SearchBar } from "@/components/ui/SearchBar";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  FoldersService,
  TagsService,
  type Folder,
  type Tag,
} from "@/lib/services/folders";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

export default function FoldersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const [searchQuery, setSearchQuery] = useState("");
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
        console.error("Failed to load folders:", foldersResult.error);
        toast.error("Failed to load folders");
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data);
      } else {
        console.error("Failed to load tags:", tagsResult.error);
      }
    } catch (error) {
      console.error("Failed to load organization data:", error);
      toast.error("Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrganizationData();
    setRefreshing(false);
  };

  // Filter folders and tags for advanced display
  const filteredData = useMemo(() => {
    let filteredFolders = folders;
    let filteredTags = tags;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredFolders = filteredFolders.filter(
        (folder) =>
          folder.name.toLowerCase().includes(query) ||
          folder.description?.toLowerCase().includes(query)
      );
      filteredTags = filteredTags.filter((tag) =>
        tag.name.toLowerCase().includes(query)
      );
    }

    // Sort folders by usage (default first, then by recipe count, then by name)
    const sortedFolders = filteredFolders.sort((a, b) => {
      if (a.is_default !== b.is_default) {
        return a.is_default ? -1 : 1;
      }
      if (a.brewprints_count !== b.brewprints_count) {
        return b.brewprints_count - a.brewprints_count;
      }
      return a.name.localeCompare(b.name);
    });

    // Sort tags by usage count
    const sortedTags = filteredTags.sort((a, b) => {
      if (a.usage_count !== b.usage_count) {
        return b.usage_count - a.usage_count;
      }
      return a.name.localeCompare(b.name);
    });

    return { folders: sortedFolders, tags: sortedTags };
  }, [folders, tags, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = () => {
    // TODO: Implement filter functionality
    console.log("Filter organization pressed");
  };

  const handleCreateFolder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Create folder - feature coming soon');
    // TODO: Implement folder creation
  };

  const handleFolderPress = (folderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Folder details - feature coming soon', folderId);
    // TODO: Implement folder details view
  };

  const handleTagPress = (tagName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Tag view - feature coming soon', tagName);
    // TODO: Implement tag filtering view
  };

  return (
    <ThemedView noBackground={false} style={styles.container}>
      {/* Scheduler-style Header for Organization */}
      <Header
        title="Organization"
        subtitle={`${filteredData.folders.length} folder${
          filteredData.folders.length === 1 ? "" : "s"
        } • ${filteredData.tags.length} tag${
          filteredData.tags.length === 1 ? "" : "s"
        }`}
        showBackButton={false}
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={true}
        onMenuPress={() => console.log("Menu pressed")}
        onProfilePress={() => console.log("Profile pressed")}
        onSearchPress={() => console.log("Search pressed")}
        showTopSpacing={true}
        rightAction={{
          icon: "plus",
          onPress: handleCreateFolder,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar with Filter */}
        <SearchBar
          placeholder="Search folders and tags..."
          onSearch={handleSearch}
          onFilterPress={handleFilterPress}
          style={styles.searchSection}
        />

        <ThemedView style={styles.organizationSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Loading organization...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Folders Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText
                    type="subtitle"
                    style={[styles.sectionTitle, { color: colors.text }]}
                  >
                    FOLDERS
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sectionCount,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {filteredData.folders.length}
                  </ThemedText>
                </View>

                {filteredData.folders.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {folders.length === 0
                        ? "Create folders to organize your brewing recipes"
                        : "No folders match your search criteria"}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.organizationGrid}>
                    {filteredData.folders.map((folder) => (
                      <TouchableOpacity
                        key={folder.id}
                        style={[
                          styles.advancedFolderCard,
                          {
                            backgroundColor: colors.cardBackground,
                            borderLeftColor: folder.color || colors.primary,
                          },
                        ]}
                        onPress={() => handleFolderPress(folder.id)}
                      >
                        {/* Folder header */}
                        <View style={styles.folderHeader}>
                          <View style={styles.folderMain}>
                            <ThemedText
                              type="defaultSemiBold"
                              style={[
                                styles.folderName,
                                { color: colors.text },
                              ]}
                            >
                              {folder.name}
                              {folder.is_default && (
                                <ThemedText
                                  style={[
                                    styles.defaultIndicator,
                                    { color: colors.primary },
                                  ]}
                                >
                                  {" "}
                                  • DEFAULT
                                </ThemedText>
                              )}
                            </ThemedText>
                            {folder.description && (
                              <ThemedText
                                style={[
                                  styles.folderDescription,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {folder.description}
                              </ThemedText>
                            )}
                          </View>
                        </View>

                        {/* Folder analytics */}
                        <View style={styles.folderAnalytics}>
                          <View style={styles.analyticsItem}>
                            <ThemedText
                              style={[
                                styles.analyticsLabel,
                                { color: colors.textSecondary },
                              ]}
                            >
                              RECIPES
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.analyticsValue,
                                { color: colors.text },
                              ]}
                            >
                              {folder.brewprints_count || 0}
                            </ThemedText>
                          </View>

                          <View style={styles.analyticsItem}>
                            <ThemedText
                              style={[
                                styles.analyticsLabel,
                                { color: colors.textSecondary },
                              ]}
                            >
                              CREATED
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.analyticsValue,
                                { color: colors.text },
                              ]}
                            >
                              {new Date(folder.created_at).toLocaleDateString()}
                            </ThemedText>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Tags Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText
                    type="subtitle"
                    style={[styles.sectionTitle, { color: colors.text }]}
                  >
                    TAGS
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sectionCount,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {filteredData.tags.length}
                  </ThemedText>
                </View>

                {filteredData.tags.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {tags.length === 0
                        ? "Tags will appear automatically as you create recipes"
                        : "No tags match your search criteria"}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.tagsContainer}>
                    {filteredData.tags.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tagCard,
                          {
                            backgroundColor: colors.cardBackgroundSecondary,
                            borderColor: tag.color || colors.border,
                          },
                        ]}
                        onPress={() => handleTagPress(tag.name)}
                      >
                        <ThemedText
                          type="defaultSemiBold"
                          style={[styles.tagName, { color: colors.text }]}
                        >
                          #{tag.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.tagUsage,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {tag.usage_count || 0} recipe
                          {(tag.usage_count || 0) === 1 ? "" : "s"}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    marginTop: 8,
  },
  organizationSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },

  // Section styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  // Empty state
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  // Organization grid
  organizationGrid: {
    gap: 12,
  },

  // Advanced folder card styles
  advancedFolderCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  folderHeader: {
    marginBottom: 12,
  },
  folderMain: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    marginBottom: 4,
  },
  defaultIndicator: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  folderDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Folder analytics
  folderAnalytics: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  analyticsItem: {
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  // Tags container
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  tagName: {
    fontSize: 13,
    marginBottom: 2,
  },
  tagUsage: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
});

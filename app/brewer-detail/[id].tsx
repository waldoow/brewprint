import { BrewersService, type Brewer } from "@/lib/services/brewers";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert, View } from "react-native";
import { toast } from "sonner-native";
import * as Haptics from "expo-haptics";

// Mock data for development - remove when real service is working
const MOCK_BREWER: Brewer = {
  id: "1",
  user_id: "user_1",
  name: "Hario V60 Size 02",
  type: "v60",
  brand: "Hario",
  model: "V60-02",
  size: "02",
  material: "ceramic",
  filter_type: "V60-02 Paper",
  capacity_ml: 500,
  optimal_dose_range: [15, 30],
  optimal_ratio_range: [15, 17],
  optimal_temp_range: [88, 96],
  optimal_grind_range: [10, 15],
  purchase_date: "2024-01-15",
  purchase_price: 29.99,
  maintenance_schedule: "weekly",
  last_maintenance: "2024-08-10",
  maintenance_notes: "Regular cleaning with mild soap",
  is_active: true,
  condition: "excellent",
  location: "Kitchen",
  notes: "Perfect for single-origin coffees. Produces clean, bright cups.",
  brewing_tips: [
    "Use circular pouring motion",
    "Start with 30g bloom for 30 seconds",
    "Maintain steady pour rate",
    "Total brew time should be 2:30-3:30"
  ],
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-08-10T14:30:00Z"
};

export default function BrewerDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [brewer, setBrewer] = useState<Brewer | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBrewer = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // For now, use mock data. Replace with actual service call:
      // const result = await BrewersService.getBrewerById(id);
      
      // Simulate API call
      setTimeout(() => {
        setBrewer(MOCK_BREWER);
        setLoading(false);
      }, 500);
      
      // When service is ready, use this:
      /*
      const result = await BrewersService.getBrewerById(id);
      if (result.success && result.data) {
        setBrewer(result.data);
      } else {
        toast.error("Failed to load brewer");
        router.back();
      }
      setLoading(false);
      */
    } catch (error) {
      console.error("Failed to load brewer:", error);
      toast.error("An error occurred while loading brewer");
      router.back();
    }
  }, [id]);

  useEffect(() => {
    loadBrewer();
  }, [loadBrewer]);

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/brewers/edit/${id}`);
  };

  const handleToggleStatus = async () => {
    if (!brewer) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newStatus = !brewer.is_active;
    const actionText = newStatus ? "activate" : "deactivate";
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Brewer`,
      `Are you sure you want to ${actionText} this brewer?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: newStatus ? "default" : "destructive",
          onPress: async () => {
            try {
              const result = await BrewersService.toggleBrewerStatus(brewer.id, newStatus);
              if (result.success && result.data) {
                setBrewer(result.data);
                toast.success(`Brewer ${newStatus ? 'activated' : 'deactivated'} successfully`);
              } else {
                toast.error(`Failed to ${actionText} brewer`);
              }
            } catch (error) {
              toast.error("An error occurred");
            }
          }
        }
      ]
    );
  };

  const handleRecordMaintenance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to maintenance recording screen
    toast.info("Maintenance recording coming soon!");
  };

  const handleDelete = () => {
    if (!brewer) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      "Delete Brewer",
      `Are you sure you want to permanently delete "${brewer.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await BrewersService.deleteBrewer(brewer.id);
              if (result.success) {
                toast.success("Brewer deleted successfully");
                router.back();
              } else {
                toast.error("Failed to delete brewer");
              }
            } catch (error) {
              toast.error("An error occurred");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionColor = (condition: Brewer['condition']) => {
    switch (condition) {
      case 'excellent': return colors.statusGreen;
      case 'good': return colors.statusGreen;
      case 'fair': return colors.statusYellow;
      case 'needs-replacement': return colors.statusRed;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? colors.statusGreen : colors.textSecondary;
  };

  if (loading) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header
          title="Loading..."
          showBackButton={true}
          onBackPress={() => router.back()}
          backButtonTitle="Inventory"
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading brewer details...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!brewer) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header
          title="Brewer Not Found"
          showBackButton={true}
          onBackPress={() => router.back()}
          backButtonTitle="Inventory"
        />
        <ThemedView style={styles.errorContainer}>
          <ThemedText>This brewer could not be found.</ThemedText>
          <ThemedButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title={brewer.name}
        subtitle={`${brewer.brand || brewer.type.toUpperCase()}${brewer.model ? ` ${brewer.model}` : ''} • ${brewer.size || 'Standard'}`}
        showBackButton={true}
        onBackPress={() => router.back()}
        backButtonTitle="Inventory"
        customContent={
          <ThemedView style={styles.headerActions}>
            <ThemedButton
              title="Edit"
              variant="outline"
              size="sm"
              onPress={handleEdit}
            />
            <ThemedButton
              title={brewer.is_active ? "Deactivate" : "Activate"}
              size="sm"
              variant={brewer.is_active ? "secondary" : "default"}
              onPress={handleToggleStatus}
            />
          </ThemedView>
        }
      />

      <ThemedScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Status Cards */}
        <ThemedView style={styles.statusSection}>
          <ThemedView style={styles.statusCard}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              STATUS
            </ThemedText>
            <ThemedBadge 
              variant={brewer.is_active ? "success" : "secondary"}
              size="default"
            >
              {brewer.is_active ? "ACTIVE" : "INACTIVE"}
            </ThemedBadge>
          </ThemedView>

          <ThemedView style={styles.statusCard}>
            <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
              CONDITION
            </ThemedText>
            <ThemedBadge 
              variant={brewer.condition === 'excellent' || brewer.condition === 'good' ? "success" : 
                      brewer.condition === 'fair' ? "warning" : "destructive"}
              size="default"
            >
              {brewer.condition.toUpperCase()}
            </ThemedBadge>
          </ThemedView>

          {brewer.location && (
            <ThemedView style={styles.statusCard}>
              <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                LOCATION
              </ThemedText>
              <ThemedText style={[styles.statusValue, { color: colors.text }]}>
                {brewer.location}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Physical Specs */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Physical Specifications
          </ThemedText>
          <ThemedView style={styles.card}>
            <ThemedView style={styles.specRow}>
              <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                Type
              </ThemedText>
              <ThemedText style={[styles.specValue, { color: colors.text }]}>
                {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}
              </ThemedText>
            </ThemedView>

            {brewer.material && (
              <ThemedView style={styles.specRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  Material
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {brewer.material.charAt(0).toUpperCase() + brewer.material.slice(1)}
                </ThemedText>
              </ThemedView>
            )}

            {brewer.filter_type && (
              <ThemedView style={styles.specRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  Filter Type
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {brewer.filter_type}
                </ThemedText>
              </ThemedView>
            )}

            {brewer.capacity_ml && (
              <ThemedView style={styles.specRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  Capacity
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {brewer.capacity_ml}ml
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        {/* Optimal Parameters */}
        {(brewer.optimal_dose_range || brewer.optimal_ratio_range || 
          brewer.optimal_temp_range || brewer.optimal_grind_range) && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Optimal Brewing Parameters
            </ThemedText>
            <ThemedView style={styles.card}>
              {brewer.optimal_dose_range && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Coffee Dose
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {brewer.optimal_dose_range[0]}g - {brewer.optimal_dose_range[1]}g
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.optimal_ratio_range && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Brew Ratio
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    1:{brewer.optimal_ratio_range[0]} - 1:{brewer.optimal_ratio_range[1]}
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.optimal_temp_range && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Water Temperature
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {brewer.optimal_temp_range[0]}°C - {brewer.optimal_temp_range[1]}°C
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.optimal_grind_range && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Grind Setting
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {brewer.optimal_grind_range[0]} - {brewer.optimal_grind_range[1]}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        )}

        {/* Purchase & Maintenance */}
        {(brewer.purchase_date || brewer.purchase_price || brewer.maintenance_schedule || 
          brewer.last_maintenance) && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Purchase & Maintenance
              </ThemedText>
              {brewer.maintenance_schedule && (
                <ThemedButton
                  title="Record Maintenance"
                  variant="outline"
                  size="sm"
                  onPress={handleRecordMaintenance}
                />
              )}
            </ThemedView>
            <ThemedView style={styles.card}>
              {brewer.purchase_date && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Purchase Date
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {formatDate(brewer.purchase_date)}
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.purchase_price && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Purchase Price
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    ${brewer.purchase_price.toFixed(2)}
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.maintenance_schedule && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Maintenance Schedule
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {brewer.maintenance_schedule.charAt(0).toUpperCase() + brewer.maintenance_schedule.slice(1)}
                  </ThemedText>
                </ThemedView>
              )}

              {brewer.last_maintenance && (
                <ThemedView style={styles.specRow}>
                  <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                    Last Maintenance
                  </ThemedText>
                  <ThemedText style={[styles.specValue, { color: colors.text }]}>
                    {formatDate(brewer.last_maintenance)}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            
            {brewer.maintenance_notes && (
              <ThemedView style={styles.card}>
                <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                  Maintenance Notes
                </ThemedText>
                <ThemedText style={[styles.cardContent, { color: colors.textSecondary }]}>
                  {brewer.maintenance_notes}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Brewing Tips */}
        {brewer.brewing_tips && brewer.brewing_tips.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Brewing Tips
            </ThemedText>
            <ThemedView style={styles.card}>
              {brewer.brewing_tips.map((tip, index) => (
                <ThemedView key={index} style={styles.tipRow}>
                  <ThemedText style={[styles.tipBullet, { color: colors.primary }]}>
                    •
                  </ThemedText>
                  <ThemedText style={[styles.tipText, { color: colors.text }]}>
                    {tip}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {/* Notes */}
        {brewer.notes && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Notes
            </ThemedText>
            <ThemedView style={styles.card}>
              <ThemedText style={[styles.cardContent, { color: colors.text }]}>
                {brewer.notes}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Danger Zone */}
        <ThemedView style={styles.dangerZone}>
          <ThemedText style={[styles.dangerTitle, { color: colors.statusRed }]}>
            Danger Zone
          </ThemedText>
          <ThemedButton
            title="Delete Brewer"
            variant="destructive"
            onPress={handleDelete}
          />
        </ThemedView>
      </ThemedScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    minWidth: 120,
  },
  
  // Header
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // Status section
  statusSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Cards
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Spec rows
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  specLabel: {
    fontSize: 14,
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },

  // Brewing tips
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 1,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Danger zone
  dangerZone: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
});
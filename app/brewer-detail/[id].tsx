import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native-ui-lib';
import { BrewersService, type Brewer } from '@/lib/services/brewers';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from 'sonner-native';

export default function BrewerDetailScreen() {
  const { id } = useLocalSearchParams();
  
  const [brewer, setBrewer] = useState<Brewer | null>(null);
  const [loading, setLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const loadBrewer = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await BrewersService.getBrewerById(id as string);
      if (result.success && result.data) {
        setBrewer(result.data);
      } else {
        toast.error('Brewer not found');
      }
    } catch {
      toast.error('Failed to load brewer details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBrewer();
  }, [loadBrewer]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const getConditionLabel = (condition: Brewer['condition']) => {
    switch (condition) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'needs-replacement': return 'Needs Replacement';
      default: return 'Unknown';
    }
  };

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
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.colors.text.primary,
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
    statsGrid: {
      flexDirection: 'row',
      gap: 16,
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
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    editButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    detailsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    notesContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
    },
    notesText: {
      fontSize: 12,
      color: theme.colors.text.primary,
      lineHeight: 18,
    },
    tipsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 12,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tipBullet: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      marginRight: 8,
      marginTop: 2,
    },
    tipText: {
      fontSize: 12,
      color: theme.colors.text.primary,
      flex: 1,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
    },
    primaryActionButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    secondaryActionButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    primaryActionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    secondaryActionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
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
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            Brewer Details
          </Text>
          <Text style={styles.pageSubtitle}>
            Loading equipment information...
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading brewer details...
          </Text>
        </View>
      </View>
    );
  }

  if (!brewer) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            Brewer Not Found
          </Text>
          <Text style={styles.pageSubtitle}>
            Equipment could not be found
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Brewer Not Found
            </Text>
            <Text style={styles.emptySubtitle}>
              The requested brewing equipment could not be found in your library.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyButtonText}>
                Back to Library
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          {brewer.name}
        </Text>
        <Text style={styles.pageSubtitle}>
          {brewer.brand || 'Brewing Equipment'} • {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Equipment Status Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Equipment Status
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Condition</Text>
              <Text style={styles.statValue}>
                {getConditionLabel(brewer.condition)}
              </Text>
            </View>
            
            {brewer.capacity_ml && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Capacity</Text>
                <Text style={styles.statValue}>
                  {brewer.capacity_ml}ml
                </Text>
              </View>
            )}
            
            {brewer.location && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Location</Text>
                <Text style={styles.statValue}>
                  {brewer.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Link href={`/(tabs)/brewers/edit/${brewer.id}`} asChild>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Text style={styles.editButtonText}>
                Edit Equipment Details
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Physical Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Physical Specifications
          </Text>
          <Text style={styles.sectionSubtitle}>
            Type, material, and construction details
          </Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Type
              </Text>
              <Text style={styles.detailValue}>
                {brewer.type.charAt(0).toUpperCase() + brewer.type.slice(1).replace('-', ' ')}
              </Text>
            </View>
            
            {brewer.material && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Material
                </Text>
                <Text style={styles.detailValue}>
                  {brewer.material.charAt(0).toUpperCase() + brewer.material.slice(1)}
                </Text>
              </View>
            )}
            
            {brewer.filter_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Filter Type
                </Text>
                <Text style={styles.detailValue}>
                  {brewer.filter_type}
                </Text>
              </View>
            )}
            
            {brewer.size && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Size
                </Text>
                <Text style={styles.detailValue}>
                  {brewer.size}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Optimal Brewing Parameters */}
        {(brewer.optimal_dose_range || brewer.optimal_ratio_range || 
          brewer.optimal_temp_range || brewer.optimal_grind_range) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Optimal Brewing Parameters
            </Text>
            <Text style={styles.sectionSubtitle}>
              Recommended settings for best results
            </Text>
            <View style={styles.detailsContainer}>
              {brewer.optimal_dose_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Coffee Dose
                  </Text>
                  <Text style={styles.detailValue}>
                    {brewer.optimal_dose_range[0]}g - {brewer.optimal_dose_range[1]}g
                  </Text>
                </View>
              )}

              {brewer.optimal_ratio_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Brew Ratio
                  </Text>
                  <Text style={styles.detailValue}>
                    1:{brewer.optimal_ratio_range[0]} - 1:{brewer.optimal_ratio_range[1]}
                  </Text>
                </View>
              )}

              {brewer.optimal_temp_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Water Temperature
                  </Text>
                  <Text style={styles.detailValue}>
                    {brewer.optimal_temp_range[0]}°C - {brewer.optimal_temp_range[1]}°C
                  </Text>
                </View>
              )}

              {brewer.optimal_grind_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Grind Setting
                  </Text>
                  <Text style={styles.detailValue}>
                    {brewer.optimal_grind_range[0]} - {brewer.optimal_grind_range[1]}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Purchase & Maintenance */}
        {(brewer.purchase_date || brewer.purchase_price || brewer.maintenance_schedule || 
          brewer.last_maintenance) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Purchase & Maintenance
            </Text>
            <Text style={styles.sectionSubtitle}>
              Purchase information and maintenance schedule
            </Text>
            <View style={styles.detailsContainer}>
              {brewer.purchase_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Purchase Date
                  </Text>
                  <Text style={styles.detailValue}>
                    {formatDate(brewer.purchase_date)}
                  </Text>
                </View>
              )}

              {brewer.purchase_price && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Purchase Price
                  </Text>
                  <Text style={styles.detailValue}>
                    ${brewer.purchase_price.toFixed(2)}
                  </Text>
                </View>
              )}

              {brewer.maintenance_schedule && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Maintenance Schedule
                  </Text>
                  <Text style={styles.detailValue}>
                    {brewer.maintenance_schedule.charAt(0).toUpperCase() + brewer.maintenance_schedule.slice(1)}
                  </Text>
                </View>
              )}

              {brewer.last_maintenance && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Last Maintenance
                  </Text>
                  <Text style={styles.detailValue}>
                    {formatDate(brewer.last_maintenance)}
                  </Text>
                </View>
              )}
            </View>
            
            {brewer.maintenance_notes && (
              <View style={[styles.notesContainer, { marginTop: 16 }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
                  Maintenance Notes
                </Text>
                <Text style={styles.notesText}>
                  {brewer.maintenance_notes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Brewing Tips */}
        {brewer.brewing_tips && brewer.brewing_tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Brewing Tips
            </Text>
            <Text style={styles.sectionSubtitle}>
              Expert techniques for optimal results
            </Text>
            <View style={styles.tipsContainer}>
              {brewer.brewing_tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Personal Notes */}
        {brewer.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>
            <Text style={styles.sectionSubtitle}>
              Personal observations and preferences
            </Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>
                {brewer.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Actions
          </Text>
          <Text style={styles.sectionSubtitle}>
            Manage equipment or start brewing
          </Text>
          <View style={styles.actionRow}>
            <Link href={`/(tabs)/brewers/edit/${brewer.id}`} asChild>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]} activeOpacity={0.7}>
                <Text style={styles.secondaryActionText}>
                  Edit Equipment
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href={`/brewprints/new?brewer_id=${brewer.id}`} asChild>
              <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]} activeOpacity={0.7}>
                <Text style={styles.primaryActionText}>
                  Create Recipe
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
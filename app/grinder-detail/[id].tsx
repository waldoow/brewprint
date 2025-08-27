import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native-ui-lib';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GrindersService, type Grinder } from '@/lib/services/grinders';
import { toast } from 'sonner-native';

export default function GrinderDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [grinder, setGrinder] = useState<Grinder | null>(null);
  const [loading, setLoading] = useState(true);

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
    conditionBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      marginTop: 4,
    },
    conditionText: {
      fontSize: 8,
      fontWeight: '600',
      color: theme.colors.text.inverse,
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

  const loadGrinder = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await GrindersService.getGrinderById(id as string);
      if (result.success && result.data) {
        setGrinder(result.data);
      } else {
        toast.error('Grinder not found');
      }
    } catch {
      toast.error('Failed to load grinder details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGrinder();
  }, [loadGrinder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionColor = (condition: Grinder['condition']) => {
    switch (condition) {
      case 'excellent': return theme.colors.success;
      case 'good': return theme.colors.success;
      case 'fair': return theme.colors.warning;
      case 'needs-replacement': return theme.colors.error;
      default: return theme.colors.surface;
    }
  };

  const getConditionLabel = (condition: Grinder['condition']) => {
    switch (condition) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'needs-replacement': return 'Needs Replacement';
      default: return 'Unknown';
    }
  };

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
            Grinder Details
          </Text>
          <Text style={styles.pageSubtitle}>
            Loading equipment information...
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading grinder details...
          </Text>
        </View>
      </View>
    );
  }

  if (!grinder) {
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
            Grinder Not Found
          </Text>
          <Text style={styles.pageSubtitle}>
            Equipment could not be found
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Grinder Not Found
            </Text>
            <Text style={styles.emptySubtitle}>
              The requested grinder could not be found in your library.
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
          {grinder.name}
        </Text>
        <Text style={styles.pageSubtitle}>
          {grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type.toUpperCase()} • {grinder.burr_material || 'Steel'} Burrs
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Edit Action */}
        <View style={styles.section}>
          <Link href={`/(tabs)/grinders/edit/${grinder.id}`} asChild>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Text style={styles.editButtonText}>
                Edit Grinder Details
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Status & Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Status & Condition
          </Text>
          <Text style={styles.sectionSubtitle}>
            Current condition and burr information
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Condition</Text>
              <Text style={styles.statValue}>
                {getConditionLabel(grinder.condition)}
              </Text>
              <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(grinder.condition) }]}>
                <Text style={styles.conditionText}>
                  {grinder.condition?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
            
            {grinder.burr_size && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Burr Size</Text>
                <Text style={styles.statValue}>
                  {grinder.burr_size}mm
                </Text>
              </View>
            )}
            
            {grinder.motor_power_watts && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Motor Power</Text>
                <Text style={styles.statValue}>
                  {grinder.motor_power_watts}W
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Physical Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Physical Specifications
          </Text>
          <Text style={styles.sectionSubtitle}>
            Type, construction, and technical details
          </Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Type
              </Text>
              <Text style={styles.detailValue}>
                {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1).replace('-', ' ')}
              </Text>
            </View>
            
            {grinder.burr_material && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Burr Material
                </Text>
                <Text style={styles.detailValue}>
                  {grinder.burr_material.charAt(0).toUpperCase() + grinder.burr_material.slice(1)}
                </Text>
              </View>
            )}
            
            {grinder.weight_grams && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Weight
                </Text>
                <Text style={styles.detailValue}>
                  {grinder.weight_grams}g
                </Text>
              </View>
            )}
            
            {grinder.hopper_capacity_grams && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Hopper Capacity
                </Text>
                <Text style={styles.detailValue}>
                  {grinder.hopper_capacity_grams}g
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Optimal Settings */}
        {(grinder.optimal_dose_range || grinder.optimal_grind_settings) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Optimal Settings
            </Text>
            <Text style={styles.sectionSubtitle}>
              Recommended grind settings and parameters
            </Text>
            <View style={styles.detailsContainer}>
              {grinder.optimal_dose_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Dose Range
                  </Text>
                  <Text style={styles.detailValue}>
                    {grinder.optimal_dose_range[0]}g - {grinder.optimal_dose_range[1]}g
                  </Text>
                </View>
              )}

              {grinder.optimal_grind_settings && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Grind Settings
                  </Text>
                  <Text style={styles.detailValue}>
                    {Array.isArray(grinder.optimal_grind_settings) 
                      ? grinder.optimal_grind_settings.join(', ')
                      : grinder.optimal_grind_settings}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Purchase & Maintenance */}
        {(grinder.purchase_date || grinder.purchase_price || grinder.last_burr_replacement || 
          grinder.burr_life_shots) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Purchase & Maintenance
            </Text>
            <Text style={styles.sectionSubtitle}>
              Purchase information and burr maintenance
            </Text>
            <View style={styles.detailsContainer}>
              {grinder.purchase_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Purchase Date
                  </Text>
                  <Text style={styles.detailValue}>
                    {formatDate(grinder.purchase_date)}
                  </Text>
                </View>
              )}

              {grinder.purchase_price && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Purchase Price
                  </Text>
                  <Text style={styles.detailValue}>
                    ${grinder.purchase_price.toFixed(2)}
                  </Text>
                </View>
              )}

              {grinder.last_burr_replacement && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Last Burr Replacement
                  </Text>
                  <Text style={styles.detailValue}>
                    {formatDate(grinder.last_burr_replacement)}
                  </Text>
                </View>
              )}

              {grinder.burr_life_shots && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Burr Life Shots
                  </Text>
                  <Text style={styles.detailValue}>
                    {grinder.burr_life_shots.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {grinder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>
            <Text style={styles.sectionSubtitle}>
              Personal observations and settings
            </Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>
                {grinder.notes}
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
            Edit details or manage this grinder
          </Text>
          <View style={styles.actionRow}>
            <Link href={`/(tabs)/grinders/edit/${grinder.id}`} asChild>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]} activeOpacity={0.7}>
                <Text style={styles.secondaryActionText}>
                  Edit Grinder
                </Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => router.push(`/brewprints/new?grinder_id=${grinder.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryActionText}>
                New Recipe
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
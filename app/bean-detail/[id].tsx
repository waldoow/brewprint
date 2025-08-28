import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native-ui-lib';
import { BeansService, type Bean } from '@/lib/services/beans';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from 'sonner-native';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams();
  const [bean, setBean] = useState<Bean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const loadBean = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await BeansService.getBeanById(id as string);
      if (result.success && result.data) {
        setBean(result.data);
      } else {
        toast.error('Bean not found');
      }
    } catch {
      toast.error('Failed to load bean details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBean();
  }, [loadBean]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
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
    section: {
      marginBottom: 32,
    },
    mainInfo: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 24,
    },
    beanName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    beanOrigin: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    statusText: {
      fontSize: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    parametersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 16,
    },
    paramItem: {
      minWidth: 80,
    },
    paramLabel: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    paramValue: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    notesSection: {
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    notesText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 6,
      borderWidth: 1,
    },
    primaryButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
    },
    primaryButtonText: {
      color: theme.colors.text.primary,
    },
    secondaryButtonText: {
      color: theme.colors.text.secondary,
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
            <Text body style={{ color: theme.colors.text.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text h1 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.xs }}>
            Bean Details
          </Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text body style={{ color: theme.colors.text.secondary }}>
            Loading bean details...
          </Text>
        </View>
      </View>
    );
  }

  if (!bean) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text body style={{ color: theme.colors.text.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text h1 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.xs }}>
            Bean Not Found
          </Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg }}>
          <View style={styles.detailCard}>
            <Text h2 style={{ color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.sm }}>
              Bean Not Found
            </Text>
            <Text body style={{ color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.lg }}>
              The requested bean could not be found.
            </Text>
            <Button
              label="Back to Library"
              onPress={() => router.back()}
              backgroundColor={theme.colors.accent}
              color={theme.colors.text.inverse}
              style={{
                borderRadius: theme.radius.lg,
                paddingVertical: theme.spacing.sm,
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Calculate freshness
  const freshnessInfo = React.useMemo(() => {
    if (!bean.roast_date) return { days: null, status: 'unknown', color: theme.colors.text.tertiary };
    
    const days = Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 7) return { days, status: 'Peak Freshness', color: theme.colors.success };
    if (days <= 14) return { days, status: 'Good', color: theme.colors.success };
    if (days <= 21) return { days, status: 'Fading', color: theme.colors.warning };
    return { days, status: 'Stale', color: theme.colors.error };
  }, [bean.roast_date, theme]);

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, color: theme.colors.text.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          {bean.name}
        </Text>
        <Text style={styles.pageSubtitle}>
          Bean Details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Bean Info */}
        <View style={styles.mainInfo}>
          <Text style={styles.beanName}>
            {bean.name}
          </Text>
          <Text style={styles.beanOrigin}>
            {bean.origin || 'Unknown Origin'}
          </Text>
          {freshnessInfo.days !== null && (
            <View style={[styles.statusBadge, { backgroundColor: freshnessInfo.color }]}>
              <Text style={[styles.statusText, { color: theme.colors.text.inverse }]}>
                {freshnessInfo.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Bean Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Details
          </Text>
          <View style={styles.parametersGrid}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>ROAST LEVEL</Text>
              <Text style={styles.paramValue}>
                {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1) : 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>WEIGHT</Text>
              <Text style={styles.paramValue}>
                {bean.weight_grams || bean.remaining_grams || 0}g
              </Text>
            </View>
            
            {bean.roast_date && (
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>ROAST DATE</Text>
                <Text style={styles.paramValue}>{formatDate(bean.roast_date)}</Text>
              </View>
            )}
            
            {bean.purchase_date && (
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>PURCHASED</Text>
                <Text style={styles.paramValue}>{formatDate(bean.purchase_date)}</Text>
              </View>
            )}
            
            {bean.price_per_kg && (
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>PRICE</Text>
                <Text style={styles.paramValue}>${bean.price_per_kg}/kg</Text>
              </View>
            )}
            
            {freshnessInfo.days !== null && (
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>AGE</Text>
                <Text style={styles.paramValue}>{freshnessInfo.days} days</Text>
              </View>
            )}
            
            {bean.supplier && (
              <View style={styles.paramItem}>
                <Text style={styles.paramLabel}>SUPPLIER</Text>
                <Text style={styles.paramValue}>{bean.supplier}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {bean.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>
            <Text style={styles.notesText}>
              {bean.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Link href={`/beans/edit/${bean.id}`} asChild>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Edit Bean
              </Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Back to Library
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


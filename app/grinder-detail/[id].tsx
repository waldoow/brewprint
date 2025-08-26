import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
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
      default: return theme.colors.gray[400];
    }
  };

  if (loading) {
    return (
      <Container>
        <PageHeader 
          title="Grinder Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading grinder details...
          </Text>
        </View>
      </Container>
    );
  }

  if (!grinder) {
    return (
      <Container>
        <PageHeader 
          title="Grinder Not Found"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <Card variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Grinder Not Found
          </Text>
          <Text 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            The requested grinder could not be found.
          </Text>
          <Button
            title="Back to Library"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <PageHeader 
        title={grinder.name}
        subtitle="Grinder Details"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <Section 
        title="Status & Overview"
        subtitle={`${grinder.brand ? `${grinder.brand}${grinder.model ? ` ${grinder.model}` : ''}` : grinder.type.toUpperCase()} • ${grinder.burr_material || 'Steel'} Burrs`}
        spacing="lg"
      >
        <Link href={`/(tabs)/grinders/edit/${grinder.id}`}>
          <Button
            title="Edit Grinder Details"
            variant="secondary"
            size="lg"
            fullWidth
          />
        </Link>
      </Section>

      <Section 
        title="Status & Condition"
        subtitle="Current condition and burr information"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text variant="caption" color="secondary">
                Condition
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getConditionColor(grinder.condition) }]}>
                <Text variant="caption" color="inverse">
                  {grinder.condition?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
            
            {grinder.burr_size && (
              <View style={styles.statusItem}>
                <Text variant="caption" color="secondary">
                  Burr Size
                </Text>
                <Text variant="body" weight="medium">
                  {grinder.burr_size}mm
                </Text>
              </View>
            )}
            
            {grinder.motor_power_watts && (
              <View style={styles.statusItem}>
                <Text variant="caption" color="secondary">
                  Motor Power
                </Text>
                <Text variant="body" weight="medium">
                  {grinder.motor_power_watts}W
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Section>

      <Section
        title="Physical Specifications"
        subtitle="Type, construction, and technical details"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text variant="caption" color="secondary">
                Type
              </Text>
              <Text variant="caption" weight="medium">
                {grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1).replace('-', ' ')}
              </Text>
            </View>
            
            {grinder.burr_material && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Burr Material
                </Text>
                <Text variant="caption" weight="medium">
                  {grinder.burr_material.charAt(0).toUpperCase() + grinder.burr_material.slice(1)}
                </Text>
              </View>
            )}
            
            {grinder.weight_grams && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Weight
                </Text>
                <Text variant="caption" weight="medium">
                  {grinder.weight_grams}g
                </Text>
              </View>
            )}
            
            {grinder.hopper_capacity_grams && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Hopper Capacity
                </Text>
                <Text variant="caption" weight="medium">
                  {grinder.hopper_capacity_grams}g
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Section>

      {(grinder.optimal_dose_range || grinder.optimal_grind_settings) && (
        <Section
          title="Optimal Settings"
          subtitle="Recommended grind settings and parameters"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {grinder.optimal_dose_range && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Dose Range
                  </Text>
                  <Text variant="caption" weight="medium">
                    {grinder.optimal_dose_range[0]}g - {grinder.optimal_dose_range[1]}g
                  </Text>
                </View>
              )}

              {grinder.optimal_grind_settings && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Grind Settings
                  </Text>
                  <Text variant="caption" weight="medium">
                    {Array.isArray(grinder.optimal_grind_settings) 
                      ? grinder.optimal_grind_settings.join(', ')
                      : grinder.optimal_grind_settings}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Section>
      )}

      {(grinder.purchase_date || grinder.purchase_price || grinder.last_burr_replacement || 
        grinder.burr_life_shots) && (
        <Section
          title="Purchase & Maintenance"
          subtitle="Purchase information and burr maintenance"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {grinder.purchase_date && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Purchase Date
                  </Text>
                  <Text variant="caption" weight="medium">
                    {formatDate(grinder.purchase_date)}
                  </Text>
                </View>
              )}

              {grinder.purchase_price && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Purchase Price
                  </Text>
                  <Text variant="caption" weight="medium">
                    ${grinder.purchase_price.toFixed(2)}
                  </Text>
                </View>
              )}

              {grinder.last_burr_replacement && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Last Burr Replacement
                  </Text>
                  <Text variant="caption" weight="medium">
                    {formatDate(grinder.last_burr_replacement)}
                  </Text>
                </View>
              )}

              {grinder.burr_life_shots && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Burr Life Shots
                  </Text>
                  <Text variant="caption" weight="medium">
                    {grinder.burr_life_shots.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Section>
      )}

      {grinder.notes && (
        <Section
          title="Notes"
          subtitle="Personal observations and settings"
          spacing="lg"
        >
          <Card variant="default">
            <Text variant="body" style={{ lineHeight: 20 }}>
              {grinder.notes}
            </Text>
          </Card>
        </Section>
      )}

      <Section
        title="Quick Actions"
        subtitle="Edit details or manage this grinder"
        spacing="xl"
      >
        <View style={styles.actionsRow}>
          <Link href={`/(tabs)/grinders/edit/${grinder.id}`} style={{ flex: 1, marginRight: 8 }}>
            <Button
              title="Edit Grinder"
              variant="secondary"
            />
          </Link>
          <Button
            title="New Recipe"
            variant="primary"
            onPress={() => router.push(`/brewprints/new?grinder_id=${grinder.id}`)}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
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
  
  statusRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  
  statusItem: {
    alignItems: 'center' as const,
    gap: 8,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  
  detailsGrid: {
    gap: 12,
  },
  
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  
  actionsRow: {
    flexDirection: 'row' as const,
  },
};
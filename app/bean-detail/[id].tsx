import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BeansService, type Bean } from '@/lib/services/beans';
import { toast } from 'sonner-native';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [bean, setBean] = useState<Bean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBean();
  }, [id]);

  const loadBean = async () => {
    try {
      setLoading(true);
      const result = await BeansService.getBeanById(id as string);
      if (result.success && result.data) {
        setBean(result.data);
      } else {
        toast.error('Bean not found');
      }
    } catch (error) {
      toast.error('Failed to load bean details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <PageHeader 
          title="Bean Details"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading bean details...
          </Text>
        </View>
      </Container>
    );
  }

  if (!bean) {
    return (
      <Container>
        <PageHeader 
          title="Bean Not Found"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <Card variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Bean Not Found
          </Text>
          <Text 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            The requested bean could not be found.
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

  const freshnessDays = bean.roast_date ? 
    Math.floor((new Date().getTime() - new Date(bean.roast_date).getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  const freshnessStatus = freshnessDays === null ? 'Unknown' :
    freshnessDays <= 7 ? 'Peak' : 
    freshnessDays <= 14 ? 'Good' : 
    freshnessDays <= 21 ? 'Fading' : 'Stale';
  
  const freshnessColor = freshnessStatus === 'Peak' ? theme.colors.success :
    freshnessStatus === 'Good' ? theme.colors.success :
    freshnessStatus === 'Fading' ? theme.colors.warning :
    freshnessStatus === 'Stale' ? theme.colors.error : theme.colors.gray[400];

  return (
    <Container scrollable>
      <Section 
        title={bean.name}
        subtitle={`${bean.origin || 'Unknown Origin'} • ${bean.supplier || 'Independent Roaster'}`}
        spacing="xl"
      >
        <Button
          title="Edit Bean Details"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.push(`/beans/edit/${bean.id}`)}
        />
      </Section>

      <Section 
        title="Bean Status"
        subtitle="Current freshness and inventory status"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text variant="caption" color="secondary">
                Freshness
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: freshnessColor }]}>
                <Text variant="caption" color="inverse">
                  {freshnessStatus.toUpperCase()}
                </Text>
              </View>
              {freshnessDays !== null && (
                <Text variant="caption" color="secondary">
                  {freshnessDays} days post-roast
                </Text>
              )}
            </View>
            
            <View style={styles.statusItem}>
              <Text variant="caption" color="secondary">
                Remaining
              </Text>
              <Text variant="h4" weight="semibold">
                {bean.remaining_grams || 0}g
              </Text>
              {bean.total_grams && (
                <Text variant="caption" color="secondary">
                  of {bean.total_grams}g total
                </Text>
              )}
            </View>
            
            <View style={styles.statusItem}>
              <Text variant="caption" color="secondary">
                Roast Level
              </Text>
              <Text variant="body" weight="medium">
                {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unknown'}
              </Text>
            </View>
          </View>
        </Card>
      </Section>

      {(bean.origin || bean.region || bean.farm || bean.altitude) && (
        <Section
          title="Origin Details"
          subtitle="Where this coffee comes from"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {bean.origin && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Country
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.origin}
                  </Text>
                </View>
              )}
              
              {bean.region && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Region
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.region}
                  </Text>
                </View>
              )}
              
              {bean.farm && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Farm
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.farm}
                  </Text>
                </View>
              )}
              
              {bean.altitude && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Altitude
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.altitude}m
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Section>
      )}

      {(bean.variety || bean.process) && (
        <Section
          title="Processing & Variety"
          subtitle="Coffee variety and processing method"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.detailsGrid}>
              {bean.variety && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Variety
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.variety}
                  </Text>
                </View>
              )}
              
              {bean.process && (
                <View style={styles.detailRow}>
                  <Text variant="caption" color="secondary">
                    Process
                  </Text>
                  <Text variant="caption" weight="medium">
                    {bean.process.charAt(0).toUpperCase() + bean.process.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Section>
      )}

      <Section
        title="Purchase Details"
        subtitle="Purchase and roasting information"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.detailsGrid}>
            {bean.roast_date && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Roast Date
                </Text>
                <Text variant="caption" weight="medium">
                  {formatDate(bean.roast_date)}
                </Text>
              </View>
            )}
            
            {bean.purchase_date && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Purchase Date
                </Text>
                <Text variant="caption" weight="medium">
                  {formatDate(bean.purchase_date)}
                </Text>
              </View>
            )}
            
            {bean.cost && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Cost
                </Text>
                <Text variant="caption" weight="medium">
                  ${bean.cost}
                </Text>
              </View>
            )}
            
            {bean.total_grams && (
              <View style={styles.detailRow}>
                <Text variant="caption" color="secondary">
                  Total Weight
                </Text>
                <Text variant="caption" weight="medium">
                  {bean.total_grams}g
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Section>

      {bean.tasting_notes && bean.tasting_notes.length > 0 && (
        <Section
          title="Flavor Profile"
          subtitle="Tasting notes and flavor characteristics"
          spacing="lg"
        >
          <Card variant="default">
            <View style={styles.tagsGrid}>
              {bean.tasting_notes.map((note, index) => (
                <View key={index} style={[styles.noteTag, { backgroundColor: theme.colors.gray[100] }]}>
                  <Text variant="caption" weight="medium">
                    {note}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      )}

      {bean.rating && (
        <Section
          title="My Rating"
          subtitle="Personal evaluation of this coffee"
          spacing="lg"
        >
          <Card variant="default" style={{ alignItems: 'center', padding: 24 }}>
            <View style={styles.ratingRow}>
              <Text variant="3xl" weight="bold">
                {bean.rating}
              </Text>
              <Text variant="lg" color="secondary">
                /5 stars
              </Text>
            </View>
          </Card>
        </Section>
      )}

      {(bean.official_description || bean.my_notes) && (
        <Section
          title="Notes & Descriptions"
          subtitle="Official descriptions and personal notes"
          spacing="lg"
        >
          {bean.official_description && (
            <Card variant="default" style={{ marginBottom: bean.my_notes ? 16 : 0 }}>
              <Text variant="body" weight="medium" style={{ marginBottom: 8 }}>
                Official Description
              </Text>
              <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
                {bean.official_description}
              </Text>
            </Card>
          )}

          {bean.my_notes && (
            <Card variant="default">
              <Text variant="body" weight="medium" style={{ marginBottom: 8 }}>
                My Notes
              </Text>
              <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
                {bean.my_notes}
              </Text>
            </Card>
          )}
        </Section>
      )}

      <Section
        title="Quick Actions"
        subtitle="Edit details or create a new brewing recipe"
        spacing="xl"
      >
        <View style={styles.actionsRow}>
          <Button
            title="Edit Bean"
            variant="secondary"
            onPress={() => router.push(`/beans/edit/${bean.id}`)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="New Recipe"
            variant="primary"
            onPress={() => router.push(`/brewprints/new?bean_id=${bean.id}`)}
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
  
  tagsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  
  noteTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  ratingRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 8,
  },
  
  actionsRow: {
    flexDirection: 'row' as const,
  },
};

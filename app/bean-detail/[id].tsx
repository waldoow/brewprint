import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
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
      <ProfessionalContainer>
        <ProfessionalHeader 
          title="Bean Details"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading bean details...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  if (!bean) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader 
          title="Bean Not Found"
          action={{
            title: 'Back',
            onPress: () => router.back(),
          }}
        />
        <ProfessionalCard variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <ProfessionalText 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Bean Not Found
          </ProfessionalText>
          <ProfessionalText 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            The requested bean could not be found.
          </ProfessionalText>
          <ProfessionalButton
            title="Back to Library"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </ProfessionalCard>
      </ProfessionalContainer>
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
    <ProfessionalContainer scrollable>
      <ProfessionalHeader
        title={bean.name}
        subtitle={`${bean.origin || 'Unknown Origin'} • ${bean.supplier || 'Independent Roaster'}`}
        action={{
          title: 'Edit',
          onPress: () => router.push(`/beans/edit/${bean.id}`),
        }}
      />

      {/* Status Overview */}
      <ProfessionalCard variant="elevated">
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <ProfessionalText variant="caption" color="secondary">
              Freshness
            </ProfessionalText>
            <View style={[styles.statusBadge, { backgroundColor: freshnessColor }]}>
              <ProfessionalText variant="caption" color="inverse">
                {freshnessStatus.toUpperCase()}
              </ProfessionalText>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <ProfessionalText variant="caption" color="secondary">
              Remaining
            </ProfessionalText>
            <ProfessionalText variant="h4" weight="semibold">
              {bean.remaining_grams || 0}g
            </ProfessionalText>
          </View>
          
          <View style={styles.statusItem}>
            <ProfessionalText variant="caption" color="secondary">
              Roast Level
            </ProfessionalText>
            <ProfessionalText variant="body" weight="medium">
              {bean.roast_level ? bean.roast_level.charAt(0).toUpperCase() + bean.roast_level.slice(1).replace('-', ' ') : 'Unknown'}
            </ProfessionalText>
          </View>
        </View>
      </ProfessionalCard>

      {/* Origin Information */}
      {(bean.origin || bean.region || bean.farm || bean.altitude) && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
            Origin Details
          </ProfessionalText>
          
          <View style={styles.detailsGrid}>
            {bean.origin && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Country
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.origin}
                </ProfessionalText>
              </View>
            )}
            
            {bean.region && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Region
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.region}
                </ProfessionalText>
              </View>
            )}
            
            {bean.farm && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Farm
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.farm}
                </ProfessionalText>
              </View>
            )}
            
            {bean.altitude && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Altitude
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.altitude}m
                </ProfessionalText>
              </View>
            )}
          </View>
        </ProfessionalCard>
      )}

      {/* Processing & Variety */}
      {(bean.variety || bean.process) && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
            Processing & Variety
          </ProfessionalText>
          
          <View style={styles.detailsGrid}>
            {bean.variety && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Variety
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.variety}
                </ProfessionalText>
              </View>
            )}
            
            {bean.process && (
              <View style={styles.detailRow}>
                <ProfessionalText variant="caption" color="secondary">
                  Process
                </ProfessionalText>
                <ProfessionalText variant="caption" weight="medium">
                  {bean.process.charAt(0).toUpperCase() + bean.process.slice(1)}
                </ProfessionalText>
              </View>
            )}
          </View>
        </ProfessionalCard>
      )}

      {/* Purchase Information */}
      <ProfessionalCard variant="default">
        <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
          Purchase Details
        </ProfessionalText>
        
        <View style={styles.detailsGrid}>
          {bean.roast_date && (
            <View style={styles.detailRow}>
              <ProfessionalText variant="caption" color="secondary">
                Roast Date
              </ProfessionalText>
              <ProfessionalText variant="caption" weight="medium">
                {formatDate(bean.roast_date)}
              </ProfessionalText>
            </View>
          )}
          
          {bean.purchase_date && (
            <View style={styles.detailRow}>
              <ProfessionalText variant="caption" color="secondary">
                Purchase Date
              </ProfessionalText>
              <ProfessionalText variant="caption" weight="medium">
                {formatDate(bean.purchase_date)}
              </ProfessionalText>
            </View>
          )}
          
          {bean.cost && (
            <View style={styles.detailRow}>
              <ProfessionalText variant="caption" color="secondary">
                Cost
              </ProfessionalText>
              <ProfessionalText variant="caption" weight="medium">
                ${bean.cost}
              </ProfessionalText>
            </View>
          )}
          
          {bean.total_grams && (
            <View style={styles.detailRow}>
              <ProfessionalText variant="caption" color="secondary">
                Total Weight
              </ProfessionalText>
              <ProfessionalText variant="caption" weight="medium">
                {bean.total_grams}g
              </ProfessionalText>
            </View>
          )}
        </View>
      </ProfessionalCard>

      {/* Tasting Notes */}
      {bean.tasting_notes && bean.tasting_notes.length > 0 && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
            Tasting Notes
          </ProfessionalText>
          <View style={styles.tagsGrid}>
            {bean.tasting_notes.map((note, index) => (
              <View key={index} style={[styles.noteTag, { backgroundColor: theme.colors.gray[100] }]}>
                <ProfessionalText variant="caption" weight="medium">
                  {note}
                </ProfessionalText>
              </View>
            ))}
          </View>
        </ProfessionalCard>
      )}

      {/* Rating */}
      {bean.rating && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
            Rating
          </ProfessionalText>
          <View style={styles.ratingRow}>
            <ProfessionalText variant="h2" weight="bold">
              {bean.rating}
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary">
              /5 stars
            </ProfessionalText>
          </View>
        </ProfessionalCard>
      )}

      {/* Descriptions */}
      {bean.official_description && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 12 }}>
            Official Description
          </ProfessionalText>
          <ProfessionalText variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {bean.official_description}
          </ProfessionalText>
        </ProfessionalCard>
      )}

      {bean.my_notes && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 12 }}>
            My Notes
          </ProfessionalText>
          <ProfessionalText variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {bean.my_notes}
          </ProfessionalText>
        </ProfessionalCard>
      )}

      {/* Actions */}
      <ProfessionalCard variant="outlined">
        <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: 16 }}>
          Actions
        </ProfessionalText>
        <View style={styles.actionsRow}>
          <ProfessionalButton
            title="Edit Bean"
            variant="secondary"
            onPress={() => router.push(`/beans/edit/${bean.id}`)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <ProfessionalButton
            title="New Brew"
            variant="primary"
            onPress={() => router.push(`/brewprints/new?bean_id=${bean.id}`)}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ProfessionalCard>
    </ProfessionalContainer>
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

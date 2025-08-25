import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BeansService, type Bean } from '@/lib/services/beans';
import { toast } from 'sonner-native';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams();
  
  const [bean, setBean] = useState<Bean | null>(null);
  const [loading, setLoading] = useState(true);

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
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <PageHeader 
        title={bean.name}
        subtitle="Bean Details"
        action={{
          title: 'Back',
          onPress: () => router.back(),
        }}
      />

      <Card variant="default" style={styles.card}>
        <Text variant="h3" weight="semibold" style={styles.title}>
          {bean.name}
        </Text>
        
        <View style={styles.detailRow}>
          <Text variant="body" color="secondary">Origin:</Text>
          <Text variant="body">{bean.origin || 'Unknown'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="secondary">Roast Level:</Text>
          <Text variant="body">{bean.roast_level || 'Unknown'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="secondary">Weight:</Text>
          <Text variant="body">{bean.weight_grams}g</Text>
        </View>

        {bean.roast_date && (
          <View style={styles.detailRow}>
            <Text variant="body" color="secondary">Roast Date:</Text>
            <Text variant="body">{formatDate(bean.roast_date)}</Text>
          </View>
        )}

        {bean.purchase_date && (
          <View style={styles.detailRow}>
            <Text variant="body" color="secondary">Purchase Date:</Text>
            <Text variant="body">{formatDate(bean.purchase_date)}</Text>
          </View>
        )}

        {bean.price && (
          <View style={styles.detailRow}>
            <Text variant="body" color="secondary">Price:</Text>
            <Text variant="body">${bean.price}</Text>
          </View>
        )}

        {bean.notes && (
          <View style={styles.notesSection}>
            <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
              Notes
            </Text>
            <Text variant="body" color="secondary">
              {bean.notes}
            </Text>
          </View>
        )}
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          title="Edit Bean"
          onPress={() => router.push(`/beans/edit/${bean.id}`)}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="Back to Library"
          onPress={() => router.back()}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
import { GrinderForm } from '@/forms/GrinderForm';
import { GrindersService } from '@/lib/services/grinders';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function EditGrinderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [grinderData, setGrinderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGrinder();
    }
  }, [id]);

  const loadGrinder = async () => {
    try {
      const result = await GrindersService.getGrinderById(id!);
      if (result.success && result.data) {
        setGrinderData(result.data);
      } else {
        toast.error('Failed to load grinder details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading grinder:', error);
      toast.error('Failed to load grinder details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Grinder updated successfully');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading grinder details...</ThemedText>
      </ThemedView>
    );
  }

  if (!grinderData) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Grinder not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <GrinderForm 
      initialData={grinderData}
      onSuccess={handleSuccess} 
      onCancel={handleCancel} 
    />
  );
}
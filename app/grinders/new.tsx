import React from 'react';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { DataLayout } from '@/components/ui/DataLayout';
import { GrinderForm } from '@/forms/GrinderForm';

export default function NewGrinderScreen() {
  const handleSuccess = () => {
    toast.success('Grinder added successfully!');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DataLayout
      title="New Grinder"
      subtitle="Add precision grinding equipment to your setup"
      scrollable
    >
      <GrinderForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </DataLayout>
  );
}
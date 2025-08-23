import React from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <Container>
      <PageHeader
        title="New Grinder"
        subtitle="Add grinding equipment"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />
      
      <GrinderForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </Container>
  );
}

const styles = StyleSheet.create({});
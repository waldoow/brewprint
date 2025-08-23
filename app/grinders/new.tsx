import React from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
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
    <ProfessionalContainer>
      <ProfessionalHeader
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
    </ProfessionalContainer>
  );
}

const styles = StyleSheet.create({});
import { GrinderForm } from '@/forms/GrinderForm';
import { router } from 'expo-router';

export default function NewGrinderScreen() {
  const handleSuccess = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <GrinderForm 
      onSuccess={handleSuccess} 
      onCancel={handleCancel} 
    />
  );
}
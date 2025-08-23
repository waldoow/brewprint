import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { BrewerForm } from "@/forms/BrewerForm";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";

export default function NewBrewerScreen() {
  const router = useRouter();

  const handleSuccess = (brewer: any) => {
    toast.success("Brewer created successfully!");
    router.push(`/(tabs)/brewer-detail/${brewer.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProfessionalContainer>
      <ProfessionalHeader
        title="New Brewer"
        subtitle="Add brewing equipment"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />
      
      <BrewerForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </ProfessionalContainer>
  );
}

const styles = StyleSheet.create({});
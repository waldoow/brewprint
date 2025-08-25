import { DataLayout } from "@/components/ui/DataLayout";
import { FolderForm } from "@/forms/FolderForm";
import { useRouter } from "expo-router";
import React from "react";

export default function NewFolderScreen() {
  const router = useRouter();

  const handleSuccess = (folder: any) => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DataLayout
      title="New Folder"
      subtitle="Create a new folder to organize your brewing recipes"
      scrollable
    >
      <FolderForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </DataLayout>
  );
}
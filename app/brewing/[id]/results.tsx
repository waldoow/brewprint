import {
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  View,
  Text,
  Card,
  TextField,
  Button,
  TouchableOpacity,
  Colors,
} from "react-native-ui-lib";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { toast } from "sonner-native";

interface ResultsForm {
  rating: string;
  notes: string;
  tds: string;
  extraction: string;
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ResultsForm>({
    rating: "",
    notes: "",
    tds: "",
    extraction: "",
  });

  const updateField = (field: keyof ResultsForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const ratingNum = parseInt(formData.rating);
    if (!formData.rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      newErrors.rating = "Please rate your brew between 1 and 5";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const rating = parseInt(formData.rating) || 0;

  const onSubmit = async () => {
    if (!validateForm()) return;
    if (!user) return;


    setSaving(true);
    try {
      // Prepare the update data according to the actual schema
      const updateData: any = {
        rating: parseInt(formData.rating),
        brewing_notes: formData.notes || "",
        brew_date: new Date().toISOString(),
        status: "final",
      };

      // Add actual_metrics if TDS or extraction data is provided
      const tdsNum = parseFloat(formData.tds);
      const extractionNum = parseFloat(formData.extraction);
      if ((!isNaN(tdsNum) && tdsNum > 0) || (!isNaN(extractionNum) && extractionNum > 0)) {
        updateData.actual_metrics = {};
        if (!isNaN(tdsNum) && tdsNum > 0) updateData.actual_metrics.tds = tdsNum;
        if (!isNaN(extractionNum) && extractionNum > 0) updateData.actual_metrics.extraction_yield = extractionNum;
      }

      const { error } = await supabase
        .from("brewprints")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Results saved successfully!");
      router.replace("/(tabs)");
    } catch (error) {
      toast.error("Failed to save results");
      console.error("Error saving results:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View flex bg-screenBG>
      <View padding-page paddingT-xxxl>
        <TouchableOpacity onPress={() => router.back()} marginB-md>
          <Text body textColor>← Back</Text>
        </TouchableOpacity>
        <Text h1 textColor marginB-xs>
          How was it?
        </Text>
        <Text body textSecondary>
          Rate and review your brewing session
        </Text>
      </View>

      <ScrollView
        style={StyleSheet.create({ scrollView: { flex: 1 } }).scrollView}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}
      >
        {/* Rating Section */}
        <View>
          <Text h3 textColor marginB-xs>
            Rate Your Brew
          </Text>
          <Text body textSecondary marginB-md>
            How did this brewing session turn out?
          </Text>
          <Card padding-md>
            <TextField
              label="Rating (1-5) *"
              placeholder="Rating 1-5"
              keyboardType="numeric"
              value={formData.rating}
              onChangeText={(value) => updateField("rating", value)}
              enableErrors={!!errors.rating}
              errorMessage={errors.rating}
              fieldStyle={styles.textField}
            />

            <Text caption textSecondary style={styles.ratingText}>
              {rating === 0 && "Tap to rate"}
              {rating === 1 && "Poor - Major issues"}
              {rating === 2 && "Below average"}
              {rating === 3 && "Good - Room for improvement"}
              {rating === 4 && "Very good - Minor tweaks needed"}
              {rating === 5 && "Excellent - Perfect brew!"}
            </Text>
          </Card>
        </View>

        {/* Notes Section */}
        <View>
          <Text h3 textColor marginB-xs>
            Tasting Notes
          </Text>
          <Text body textSecondary marginB-md>
            Describe the taste, aroma, and overall experience
          </Text>
          <Card padding-md>
            <TextField
              label="Brewing Notes"
              placeholder="Describe the taste, aroma, body, and any adjustments for next time..."
              multiline
              numberOfLines={6}
              value={formData.notes}
              onChangeText={(value) => updateField("notes", value)}
              fieldStyle={[styles.textField, styles.textArea]}
            />
          </Card>
        </View>

        {/* Measurements Section (Optional) */}
        <View>
          <Text h3 textColor marginB-xs>
            Measurements (Optional)
          </Text>
          <Text body textSecondary marginB-md>
            Record TDS and extraction measurements if available
          </Text>
          <Card padding-md>
            <View row gap-md>
              <View flex>
                <TextField
                  label="TDS %"
                  placeholder="1.35"
                  keyboardType="decimal-pad"
                  value={formData.tds}
                  onChangeText={(value) => updateField("tds", value)}
                  fieldStyle={[styles.textField, styles.measurementInput]}
                />
              </View>
              <View flex>
                <TextField
                  label="Extraction %"
                  placeholder="20.5"
                  keyboardType="decimal-pad"
                  value={formData.extraction}
                  onChangeText={(value) => updateField("extraction", value)}
                  fieldStyle={[styles.textField, styles.measurementInput]}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View>
          <Text h3 textColor marginB-xs>
            Save Results
          </Text>
          <Text body textSecondary marginB-md>
            Complete your brewing session
          </Text>
          <Card padding-md>
            <View style={{ gap: 12 }}>
              <Button
                label="Save & Finish"
                onPress={onSubmit}
                backgroundColor={Colors.blue30}
                size="large"
                fullWidth
                disabled={saving || rating === 0}
              />

              <Button
                label="Save & Brew Again"
                onPress={async () => {
                  await onSubmit();
                  router.push(`/brewing/${id}`);
                }}
                backgroundColor={Colors.grey40}
                size="large"
                fullWidth
                disabled={saving || rating === 0}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  textField: {
    borderWidth: 1,
    borderColor: Colors.grey40,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  ratingText: {
    textAlign: "center" as const,
    marginTop: 8,
  },
  textArea: {
    minHeight: 120,
  },
  measurementInput: {
    textAlign: "center" as const,
  },
});

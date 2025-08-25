import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { DataCard, InfoCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";

// Zod schema for forgot password validation
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  onResetPassword?: (data: ForgotPasswordFormData) => Promise<void>;
  onNavigateToSignIn?: () => void;
}

export default function ForgotPassword({
  onResetPassword,
  onNavigateToSignIn,
}: ForgotPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const colorScheme = useColorScheme();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);

      if (onResetPassword) {
        await onResetPassword(data);
        setEmailSent(true);
      } else {
        // Mock reset password for demo
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setEmailSent(true);
        toast.success("Reset email sent!", {
          description: "Please check your email for reset instructions.",
        });
      }
    } catch (error) {
      // Let the parent component handle the error toast
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = form.getValues("email");
    if (email) {
      await onSubmit({ email });
    }
  };

  const theme = getTheme(colorScheme ?? "light");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {/* Clean Header */}
        <View style={styles.header}>
          <DataText 
            variant="display" 
            weight="bold" 
            color="primary"
            style={{
              textAlign: 'center',
              marginBottom: theme.spacing[2]
            }}
          >
            Brewprint
          </DataText>
          <DataText 
            variant="body" 
            color="secondary"
            style={{
              textAlign: 'center',
            }}
          >
            Professional Coffee Recipe Management
          </DataText>
        </View>

        {/* Clean Form Card */}
        <DataCard style={styles.formCard}>
          <View style={{ gap: 16 }}>
            <View style={styles.formHeader}>
              <DataText 
                variant="h1" 
                weight="semibold" 
                color="primary"
                style={{ marginBottom: theme.spacing[2] }}
              >
                {emailSent ? "Check Your Email" : "Reset Password"}
              </DataText>
              <DataText 
                variant="body" 
                color="secondary"
                style={{ textAlign: 'center' }}
              >
                {emailSent
                  ? "Password reset instructions sent to your email"
                  : "Enter your email to reset your password"
                }
              </DataText>
            </View>

            <Form {...form}>
              <View style={styles.form}>
                {!emailSent ? (
                  <>
                    {/* Email Input */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <DataText variant="small" weight="medium" color="primary">
                              Email Address
                            </DataText>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              value={field.value}
                              onChangeText={field.onChange}
                              onBlur={field.onBlur}
                              editable={!isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reset Password Button */}
                    <DataButton
                      title="Send Reset Instructions"
                      variant="primary"
                      size="lg"
                      fullWidth
                      onPress={form.handleSubmit(onSubmit)}
                      disabled={isLoading}
                      loading={isLoading}
                      style={{
                        marginTop: theme.spacing[6]
                      }}
                    />
                  </>
                ) : (
                  <View style={styles.emailSentContainer}>
                    <InfoCard
                      title="Email Sent"
                      message="If an account with that email exists, you'll receive password reset instructions shortly."
                      variant="success"
                      action={{
                        title: "Resend Email",
                        onPress: handleResendEmail,
                        variant: "secondary",
                        disabled: isLoading,
                        loading: isLoading
                      }}
                    />
                  </View>
                )}
              </View>
            </Form>
          </View>
        </DataCard>

        {/* Back to Sign In */}
        <View style={styles.backSection}>
          <DataText 
            variant="body" 
            color="secondary"
            style={{ textAlign: 'center', marginBottom: theme.spacing[4] }}
          >
            Remember your password?
          </DataText>
          <DataButton
            variant="secondary"
            size="lg"
            fullWidth
            title="Back to Sign In"
            onPress={onNavigateToSignIn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  formCard: {
    marginBottom: 32,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  emailSentContainer: {
    alignItems: "center",
  },
  backSection: {
    alignItems: "center",
  },
});

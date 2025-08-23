import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
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
import { ProfessionalButton } from "@/components/ui/professional/Button";
import { ProfessionalCard } from "@/components/ui/professional/Card";
import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalInput } from "@/components/ui/professional/Input";
import { ProfessionalText } from "@/components/ui/professional/Text";
import { getTheme } from "@/constants/ProfessionalDesign";
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
    <ProfessionalContainer scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ProfessionalText
              variant="h1"
              weight="semibold"
              style={styles.title}
            >
              {emailSent ? "Check Your Email" : "Forgot Password"}
            </ProfessionalText>
            <ProfessionalText
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              {emailSent
                ? `We've sent password reset instructions to your email address.`
                : "Enter your email address and we'll send you instructions to reset your password."}
            </ProfessionalText>
          </View>

          {/* Form Card */}
          <ProfessionalCard variant="default" style={styles.formCard}>
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
                            <ProfessionalText variant="label" weight="medium">
                              Email
                            </ProfessionalText>
                          </FormLabel>
                          <FormControl>
                            <ProfessionalInput
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
                    <ProfessionalButton
                      title="Send Reset Instructions"
                      onPress={form.handleSubmit(onSubmit)}
                      disabled={isLoading}
                      loading={isLoading}
                      style={styles.resetButton}
                    />
                  </>
                ) : (
                  <View style={styles.emailSentContainer}>
                    {/* Success Message */}
                    <View style={styles.successMessage}>
                      <ProfessionalText
                        variant="h2"
                        style={styles.checkEmailText}
                      >
                        📧
                      </ProfessionalText>
                      <ProfessionalText
                        variant="body"
                        color="secondary"
                        style={styles.instructionsText}
                      >
                        If an account with that email exists, you&apos;ll
                        receive password reset instructions shortly.
                      </ProfessionalText>
                    </View>

                    {/* Resend Email Button */}
                    <ProfessionalButton
                      variant="secondary"
                      title="Resend Email"
                      onPress={handleResendEmail}
                      disabled={isLoading}
                      loading={isLoading}
                      style={styles.resendButton}
                    />
                  </View>
                )}
              </View>
            </Form>
          </ProfessionalCard>

          {/* Back to Sign In Link */}
          <View style={styles.backToSignInContainer}>
            <TouchableOpacity
              onPress={onNavigateToSignIn}
              disabled={isLoading}
              style={styles.backToSignInButton}
            >
              <ArrowLeft size={16} color={theme.colors.gray[600]} />
              <ProfessionalText
                variant="body"
                color="secondary"
                style={styles.backToSignInText}
              >
                Back to Sign In
              </ProfessionalText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ProfessionalContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  resetButton: {
    marginTop: 8,
  },
  emailSentContainer: {
    alignItems: "center",
  },
  successMessage: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  checkEmailText: {
    fontSize: 48,
    marginBottom: 16,
  },
  instructionsText: {
    textAlign: "center",
    lineHeight: 24,
  },
  resendButton: {
    marginBottom: 16,
  },
  backToSignInContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  backToSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backToSignInText: {
    fontSize: 16,
  },
});

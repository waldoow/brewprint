import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Colors } from "@/constants/Colors";
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

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.content}>
              {/* Header */}
              <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  {emailSent ? "Check Your Email" : "Forgot Password"}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  {emailSent
                    ? `We've sent password reset instructions to your email address.`
                    : "Enter your email address and we'll send you instructions to reset your password."}
                </ThemedText>
              </ThemedView>

              {/* Form */}
              <Form {...form}>
                <ThemedView style={styles.form}>
                  {!emailSent ? (
                    <>
                      {/* Email Input */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <ThemedInput
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
                      <ThemedButton
                        title={
                          isLoading ? "Sending..." : "Send Reset Instructions"
                        }
                        onPress={form.handleSubmit(onSubmit)}
                        disabled={isLoading}
                        loading={isLoading}
                        style={styles.resetButton}
                      />
                    </>
                  ) : (
                  <ThemedView style={styles.emailSentContainer}>
                    {/* Success Message */}
                    <ThemedView style={styles.successMessage}>
                      <ThemedText style={styles.checkEmailText}>📧</ThemedText>
                      <ThemedText style={styles.instructionsText}>
                        If an account with that email exists, you&apos;ll
                        receive password reset instructions shortly.
                      </ThemedText>
                    </ThemedView>

                    {/* Resend Email Button */}
                    <ThemedButton
                      variant="outline"
                      title="Resend Email"
                      onPress={handleResendEmail}
                      disabled={isLoading}
                      loading={isLoading}
                      style={styles.resendButton}
                    />
                  </ThemedView>
                  )}

                  {/* Back to Sign In Link */}
                  <ThemedView style={styles.backToSignInContainer}>
                  <TouchableOpacity
                    onPress={onNavigateToSignIn}
                    disabled={isLoading}
                    style={styles.backToSignInButton}
                  >
                    <ArrowLeft
                      size={16}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText type="link" style={styles.backToSignInText}>
                      Back to Sign In
                    </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              </Form>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
  content: {
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
    opacity: 0.7,
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 32,
  },
  emailSentContainer: {
    alignItems: "center",
    marginBottom: 32,
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
    opacity: 0.8,
    lineHeight: 22,
  },
  resendButton: {
    marginBottom: 16,
  },
  backToSignInContainer: {
    alignItems: "center",
  },
  backToSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backToSignInText: {
    fontSize: 14,
  },
});

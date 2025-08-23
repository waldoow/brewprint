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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Section } from "@/components/ui/Section";
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
    <Container scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Section 
            title={emailSent ? "Check Your Email" : "Password Recovery"}
            subtitle={emailSent
              ? "We've sent password reset instructions to your email address"
              : "Enter your email to reset your password and get back to brewing"}
            variant="accent"
            spacing="xl"
            style={{ marginBottom: 32 }}
          />

          <Section 
            title={emailSent ? "Email Sent" : "Reset Password"}
            variant="elevated"
            spacing="lg"
          >
            <Card variant="elevated" style={styles.formCard}>
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
                            <Text variant="label" weight="medium">
                              Email
                            </Text>
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
                    <Button
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
                      <Text
                        variant="3xl"
                        style={styles.checkEmailText}
                      >
                        📧
                      </Text>
                      <Text
                        variant="body"
                        color="secondary"
                        style={styles.instructionsText}
                      >
                        If an account with that email exists, you'll receive password reset instructions shortly.
                      </Text>
                    </View>

                    {/* Resend Email Button */}
                    <Button
                      title="Resend Email"
                      variant="secondary"
                      onPress={handleResendEmail}
                      disabled={isLoading}
                      loading={isLoading}
                      style={styles.resendButton}
                    />
                  </View>
                )}
              </View>
            </Form>
            </Card>
          </Section>

          <Section 
            title="Ready to Sign In?"
            subtitle="Return to the sign-in page when you're ready"
            variant="accent"
            spacing="lg"
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              title="Back to Sign In"
              onPress={onNavigateToSignIn}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          </Section>
        </View>
      </KeyboardAvoidingView>
    </Container>
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

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const validateEmail = (email: string): string | null => {
    try {
      forgotPasswordSchema.parse({ email });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid email";
      }
      return "Invalid email";
    }
  };

  const onSubmit = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setError("");
    
    try {
      setIsLoading(true);

      if (onResetPassword) {
        await onResetPassword({ email });
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
    if (email) {
      await onSubmit();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Container>
        {/* App Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: theme.spacing['5xl'],
          marginTop: theme.spacing['2xl'],
        }}>
          <Text variant="4xl" weight="extrabold" style={{ marginBottom: theme.spacing.sm }}>
            Brewprint
          </Text>
          <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Professional Coffee Recipe Management
          </Text>
        </View>

        {/* Form Card */}
        <Card variant="default" style={{ marginBottom: theme.spacing.xl }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <Text variant="2xl" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
              {emailSent ? "Check Your Email" : "Reset Password"}
            </Text>
            <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
              {emailSent
                ? "Password reset instructions sent to your email"
                : "Enter your email to reset your password"
              }
            </Text>
          </View>

          <View>
            {!emailSent ? (
              <>
                {/* Email Input */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text variant="label" weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                    Email Address
                  </Text>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    disabled={isLoading}
                    error={error}
                  />
                </View>

                {/* Reset Password Button */}
                <Button
                  title="Send Reset Instructions"
                  onPress={onSubmit}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  style={{ marginTop: theme.spacing.lg }}
                />
              </>
            ) : (
              <View style={{ alignItems: 'center' }}>
                {/* Success Card */}
                <Card 
                  variant="success"
                  style={{ 
                    marginBottom: theme.spacing.lg,
                    width: '100%',
                  }}
                >
                  <Text variant="lg" weight="semibold" style={{ 
                    textAlign: 'center',
                    marginBottom: theme.spacing.sm,
                    color: theme.colors.success,
                  }}>
                    Email Sent
                  </Text>
                  <Text variant="body" color="secondary" style={{ 
                    textAlign: 'center',
                    marginBottom: theme.spacing.lg,
                  }}>
                    If an account with that email exists, you'll receive password reset instructions shortly.
                  </Text>
                  <Button
                    title="Resend Email"
                    onPress={handleResendEmail}
                    variant="outline"
                    loading={isLoading}
                  />
                </Card>
              </View>
            )}
          </View>
        </Card>

        {/* Back to Sign In */}
        <View style={{ alignItems: 'center' }}>
          <Text variant="body" color="secondary" style={{
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            Remember your password?
          </Text>
          <Button
            title="Back to Sign In"
            onPress={onNavigateToSignIn}
            variant="outline"
            fullWidth
            disabled={isLoading}
          />
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

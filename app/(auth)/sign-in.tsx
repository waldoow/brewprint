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
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

// Zod schema for sign-in validation
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInProps {
  onSignIn?: (data: SignInFormData) => Promise<void>;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export default function SignIn({
  onSignIn,
  onNavigateToSignUp,
  onForgotPassword,
}: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});

  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const validateForm = (): SignInFormData | null => {
    try {
      const data = signInSchema.parse({ email, password });
      setErrors({});
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: Partial<SignInFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as keyof SignInFormData] = err.message;
          }
        });
        setErrors(formErrors);
      }
      return null;
    }
  };

  const onSubmit = async () => {
    const validatedData = validateForm();
    if (!validatedData) return;

    try {
      setIsLoading(true);

      if (onSignIn) {
        await onSignIn(validatedData);
        setEmail("");
        setPassword("");
        setErrors({});
      } else {
        // Mock sign-in for demo
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        setEmail("");
        setPassword("");
        setErrors({});
      }
    } catch (error) {
      // Let the parent component handle the error toast
      throw error;
    } finally {
      setIsLoading(false);
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

        {/* Sign In Card */}
        <Card variant="default" style={{ marginBottom: theme.spacing.xl }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <Text variant="2xl" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
              Sign In
            </Text>
            <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
              Access your brewing recipes and data
            </Text>
          </View>

          <View>
            {/* Email Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text variant="label" weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                Email Address
              </Text>
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
                error={errors.email}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text variant="label" weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                Password
              </Text>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                disabled={isLoading}
                error={errors.password}
              />
            </View>

            {/* Forgot Password Link */}
            <View style={{ alignItems: 'flex-end', marginBottom: theme.spacing.lg }}>
              <Button
                title="Forgot your password?"
                onPress={onForgotPassword}
                variant="ghost"
                size="sm"
                disabled={isLoading}
              />
            </View>

            {/* Sign In Button */}
            <Button
              title="Sign In"
              onPress={onSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        </Card>

        {/* Sign Up Section */}
        <View style={{ alignItems: 'center' }}>
          <Text variant="body" color="secondary" style={{ 
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            Don&apos;t have an account?
          </Text>
          <Button
            title="Create Account"
            onPress={onNavigateToSignUp}
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

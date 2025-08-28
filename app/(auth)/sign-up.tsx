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
import { useColorScheme } from '@/hooks/useColorScheme';

// Zod schema for sign-up validation
const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
  onSignUp?: (
    data: Omit<SignUpFormData, "confirmPassword">
  ) => Promise<void>;
  onNavigateToSignIn?: () => void;
}

export default function SignUp({
  onSignUp,
  onNavigateToSignIn,
}: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const validateForm = (): Omit<SignUpFormData, "confirmPassword"> | null => {
    try {
      const data = signUpSchema.parse({ username, email, password, confirmPassword });
      setErrors({});
      const { confirmPassword: _, ...submitData } = data;
      return submitData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: Partial<SignUpFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as keyof SignUpFormData] = err.message;
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

      if (onSignUp) {
        await onSignUp(validatedData);
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
      } else {
        // Mock sign-up for demo
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Account created successfully!", {
          description: "Welcome to our platform. You can now sign in.",
        });
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
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
      <Container scrollable>
        {/* App Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: theme.spacing['4xl'],
          marginTop: theme.spacing.xl,
        }}>
          <Text variant="4xl" weight="extrabold" style={{ marginBottom: theme.spacing.sm }}>
            Brewprint
          </Text>
          <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Professional Coffee Recipe Management
          </Text>
        </View>

        {/* Sign Up Card */}
        <Card variant="default" style={{ marginBottom: theme.spacing.xl }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <Text variant="2xl" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
              Create Account
            </Text>
            <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
              Join the professional coffee community
            </Text>
          </View>

          <View>
            {/* Username Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text variant="label" weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                Username
              </Text>
              <Input
                placeholder="Choose a unique username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
                error={errors.username}
              />
            </View>

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
                placeholder="Create a secure password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                disabled={isLoading}
                error={errors.password}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text variant="label" weight="medium" style={{ marginBottom: theme.spacing.xs }}>
                Confirm Password
              </Text>
              <Input
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                disabled={isLoading}
                error={errors.confirmPassword}
              />
            </View>

            {/* Create Account Button */}
            <Button
              title="Create Account"
              onPress={onSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        </Card>

        {/* Sign In Section */}
        <View style={{ alignItems: 'center' }}>
          <Text variant="body" color="secondary" style={{
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            Already have an account?
          </Text>
          <Button
            title="Sign In"
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

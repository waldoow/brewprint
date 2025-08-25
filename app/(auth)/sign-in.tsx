import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DataCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { Input } from '@/components/ui/Input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

const { height } = Dimensions.get('window');

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

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);

      if (onSignIn) {
        await onSignIn(data);
        form.reset();
      } else {
        // Mock sign-in for demo
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        form.reset();
      }
    } catch (error) {
      // Let the parent component handle the error toast
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {/* Clean App Header */}
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

        {/* Clean Sign In Card */}
        <DataCard style={styles.authCard}>
          <View style={{ gap: 16 }}>
            <View style={styles.authHeader}>
              <DataText 
                variant="h1" 
                weight="semibold" 
                color="primary"
                style={{ marginBottom: theme.spacing[2] }}
              >
                Sign In
              </DataText>
              <DataText 
                variant="body" 
                color="secondary"
                style={{ textAlign: 'center' }}
              >
                Access your brewing recipes and data
              </DataText>
            </View>

            <Form {...form}>
              <View style={styles.form}>
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

                {/* Password Input */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <DataText variant="small" weight="medium" color="primary">
                          Password
                        </DataText>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
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

                {/* Forgot Password Link */}
                <DataButton
                  variant="ghost"
                  title="Forgot your password?"
                  onPress={onForgotPassword}
                  style={styles.forgotPassword}
                />

                {/* Clean Sign In Button */}
                <DataButton
                  title="Sign In"
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
              </View>
            </Form>
          </View>
        </DataCard>

        {/* Sign Up Section */}
        <View style={styles.signUpSection}>
          <DataText 
            variant="body" 
            color="secondary"
            style={{ textAlign: 'center', marginBottom: theme.spacing[4] }}
          >
            Don&apos;t have an account?
          </DataText>
          <DataButton
            variant="secondary"
            size="lg"
            fullWidth
            title="Create Account"
            onPress={onNavigateToSignUp}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    paddingTop: 20,
  },
  authCard: {
    marginBottom: 32,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
  },
  signUpSection: {
    alignItems: 'center',
  },
});

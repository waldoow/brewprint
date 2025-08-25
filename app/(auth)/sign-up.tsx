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

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);

      const { confirmPassword, ...submitData } = data;

      if (onSignUp) {
        await onSignUp(submitData);
        form.reset();
      } else {
        // Mock sign-up for demo
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Account created successfully!", {
          description: "Welcome to our platform. You can now sign in.",
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

        {/* Clean Sign Up Card */}
        <DataCard style={styles.authCard}>
          <View style={{ gap: 16 }}>
            <View style={styles.authHeader}>
              <DataText 
                variant="h1" 
                weight="semibold" 
                color="primary"
                style={{ marginBottom: theme.spacing[2] }}
              >
                Create Account
              </DataText>
              <DataText 
                variant="body" 
                color="secondary"
                style={{ textAlign: 'center' }}
              >
                Join the professional coffee community
              </DataText>
            </View>

            <Form {...form}>
              <View style={styles.form}>
                {/* Username Input */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <DataText variant="small" weight="medium" color="primary">
                          Username
                        </DataText>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a unique username"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          autoCapitalize="none"
                          editable={!isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Create a secure password"
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

                {/* Confirm Password Input */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <DataText variant="small" weight="medium" color="primary">
                          Confirm Password
                        </DataText>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
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

                {/* Clean Create Account Button */}
                <DataButton
                  title="Create Account"
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

        {/* Sign In Section */}
        <View style={styles.signInSection}>
          <DataText 
            variant="body" 
            color="secondary"
            style={{ textAlign: 'center', marginBottom: theme.spacing[4] }}
          >
            Already have an account?
          </DataText>
          <DataButton
            variant="secondary"
            size="lg"
            fullWidth
            title="Sign In"
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  signInSection: {
    alignItems: 'center',
  },
});

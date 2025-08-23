import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

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

  return (
    <Container scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Section 
            title="Join Brewprint"
            subtitle="Create your account to start perfecting your coffee craft"
            variant="accent"
            spacing="xl"
            style={{ marginBottom: 32 }}
          />

          <Section 
            title="Account Information"
            variant="elevated"
            spacing="lg"
          >
            <Card variant="elevated" style={styles.formCard}>
            <Form {...form}>
              <View style={styles.form}>
                {/* Username Input */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Text variant="label" weight="medium">
                          Username
                        </Text>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a username"
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

                {/* Password Input */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Text variant="label" weight="medium">
                          Password
                        </Text>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
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
                        <Text variant="label" weight="medium">
                          Confirm Password
                        </Text>
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

                {/* Sign Up Button */}
                <Button
                  title="Create Account"
                  onPress={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.signUpButton}
                />
              </View>
            </Form>
            </Card>
          </Section>

          <Section 
            title="Already Have an Account?"
            subtitle="Sign in to continue your coffee journey"
            variant="accent"
            spacing="lg"
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              title="Sign In to Your Account"
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
  },
  formCard: {
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  signUpButton: {
    marginTop: 8,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  signInText: {
    fontSize: 16,
  },
});

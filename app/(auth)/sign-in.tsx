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

  return (
    <Container scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Section 
            title="Welcome Back"
            subtitle="Sign in to continue your coffee journey"
            variant="accent"
            spacing="xl"
            style={{ marginBottom: 32 }}
          />

          <Section 
            title="Account Access"
            variant="elevated"
            spacing="lg"
          >
            <Card variant="elevated" style={styles.formCard}>
            <Form {...form}>
              <View style={styles.form}>
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

                {/* Forgot Password */}
                <Button
                  variant="ghost"
                  title="Forgot your password?"
                  onPress={onForgotPassword}
                  style={styles.forgotPassword}
                />

                {/* Sign In Button */}
                <Button
                  title="Sign In"
                  onPress={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.signInButton}
                />
              </View>
            </Form>
            </Card>
          </Section>

          <Section 
            title="New to Brewprint?"
            subtitle="Join thousands of coffee enthusiasts perfecting their craft"
            variant="accent"
            spacing="lg"
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              title="Create Your Account"
              onPress={onNavigateToSignUp}
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  signInButton: {
    marginTop: 8,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  signUpText: {
    fontSize: 16,
  },
});

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

import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalCard } from "@/components/ui/professional/Card";
import { ProfessionalText } from "@/components/ui/professional/Text";
import { ProfessionalButton } from "@/components/ui/professional/Button";
import { ProfessionalInput } from "@/components/ui/professional/Input";
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
    <ProfessionalContainer scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ProfessionalText variant="h1" weight="semibold" style={styles.title}>
              Welcome Back
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" style={styles.subtitle}>
              Sign in to your account to continue
            </ProfessionalText>
          </View>

          {/* Form Card */}
          <ProfessionalCard variant="default" style={styles.formCard}>
            <Form {...form}>
              <View style={styles.form}>
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

                {/* Password Input */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <ProfessionalText variant="label" weight="medium">
                          Password
                        </ProfessionalText>
                      </FormLabel>
                      <FormControl>
                        <ProfessionalInput
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
                <ProfessionalButton
                  variant="ghost"
                  title="Forgot your password?"
                  onPress={onForgotPassword}
                  style={styles.forgotPassword}
                />

                {/* Sign In Button */}
                <ProfessionalButton
                  title="Sign In"
                  onPress={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.signInButton}
                />
              </View>
            </Form>
          </ProfessionalCard>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <ProfessionalText variant="body" color="secondary" style={styles.signUpText}>
              Don&apos;t have an account?{" "}
            </ProfessionalText>
            <ProfessionalButton
              variant="ghost"
              title="Sign Up"
              onPress={onNavigateToSignUp}
            />
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

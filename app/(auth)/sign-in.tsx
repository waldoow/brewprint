import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
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
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        reset();
      } else {
        // Mock sign-in for demo
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        reset();
      }
    } catch (error) {
      toast.error("Sign in failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
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
                  Welcome Back
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Sign in to your account to continue
                </ThemedText>
              </ThemedView>

              {/* Form */}
              <ThemedView style={styles.form}>
                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      editable={!isLoading}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      editable={!isLoading}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />

                {/* Forgot Password */}
                <ThemedButton
                  variant="link"
                  title="Forgot your password?"
                  onPress={onForgotPassword}
                  style={styles.forgotPassword}
                />

                {/* Sign In Button */}
                <ThemedButton
                  title={isLoading ? "Signing In..." : "Sign In"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.signInButton}
                />

                {/* Sign Up Link */}
                <ThemedView style={styles.signUpContainer}>
                  <ThemedText style={styles.signUpText}>
                    Don&apos;t have an account?{" "}
                  </ThemedText>
                  <ThemedButton
                    variant="link"
                    title="Sign Up"
                    onPress={onNavigateToSignUp}
                  />
                </ThemedView>
              </ThemedView>
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
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  signInButton: {
    marginBottom: 24,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signUpLink: {
    fontSize: 14,
  },
});

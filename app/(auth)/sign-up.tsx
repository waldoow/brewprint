import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

// Zod schema for sign-up validation
const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
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
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
  onSignUp?: (
    data: Omit<SignUpFormData, "confirmPassword" | "acceptTerms">
  ) => Promise<void>;
  onNavigateToSignIn?: () => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

export default function SignUp({
  onSignUp,
  onNavigateToSignIn,
  onTermsPress,
  onPrivacyPress,
}: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);

      const { confirmPassword, acceptTerms, ...submitData } = data;

      if (onSignUp) {
        await onSignUp(submitData);
        toast.success("Account created successfully!", {
          description: "Welcome to our platform. You can now sign in.",
        });
        reset();
      } else {
        // Mock sign-up for demo
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Account created successfully!", {
          description: "Welcome to our platform. You can now sign in.",
        });
        reset();
      }
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
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
                  Create Account
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Sign up to get started with your new account
                </ThemedText>
              </ThemedView>

              {/* Form */}
              <ThemedView style={styles.form}>
                {/* Username Input */}
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Username"
                      placeholder="Choose a username"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.username?.message}
                      autoCapitalize="none"
                      editable={!isLoading}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />

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
                      placeholder="Create a password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      editable={!isLoading}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />

                {/* Confirm Password Input */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      editable={!isLoading}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />

                {/* Terms Checkbox */}
                {/* <ThemedView style={styles.checkboxContainer}>
                  <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field: { onChange, value } }) => (
                      <ThemedView>
                        <ThemedCheckBox
                          checked={value}
                          onCheckedChange={onChange}
                          disabled={isLoading}
                          containerStyle={styles.checkbox}
                        />
                        <ThemedView style={styles.checkboxText}>
                          <ThemedText style={styles.termsText}>
                            I agree to the{" "}
                            <TouchableOpacity onPress={onTermsPress}>
                              <ThemedText type="link" style={styles.termsLink}>
                                Terms of Service
                              </ThemedText>
                            </TouchableOpacity>{" "}
                            and{" "}
                            <TouchableOpacity onPress={onPrivacyPress}>
                              <ThemedText type="link" style={styles.termsLink}>
                                Privacy Policy
                              </ThemedText>
                            </TouchableOpacity>
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    )}
                  />
                  {errors.acceptTerms && (
                    <ThemedText style={[styles.errorText, { marginLeft: 32 }]}>
                      {errors.acceptTerms.message}
                    </ThemedText>
                  )}
                </ThemedView> */}

                {/* Sign Up Button */}
                <ThemedButton
                  title={isLoading ? "Creating Account..." : "Create Account"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.signUpButton}
                />

                {/* Sign In Link */}
                <ThemedView style={styles.signInContainer}>
                  <ThemedText style={styles.signInText}>
                    Already have an account?{" "}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={onNavigateToSignIn}
                    disabled={isLoading}
                  >
                    <ThemedButton variant="link" title="Sign In" />
                  </TouchableOpacity>
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
    marginBottom: 32,
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
    marginBottom: 16,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkbox: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 32,
    marginTop: -24,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  termsLink: {
    fontSize: 14,
  },
  signUpButton: {},
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signInLink: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
    color: "#dc2626",
  },
});

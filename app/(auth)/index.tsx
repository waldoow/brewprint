import React, { useState } from "react";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import ForgotPassword from "./forgot-password";
import SignIn from "./sign-in";
import SignUp from "./sign-up";

type AuthScreen = "sign-in" | "sign-up" | "forgot-password";

export default function AuthIndex() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("sign-in");

  const handleSignIn = async (data: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Welcome back!");
      router.replace("/(tabs)");
    } catch (error) {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "Invalid email or password",
      });
      // Don't re-throw, let this function handle the error completely
    }
  };

  const handleSignUp = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Account created successfully", {
        description: "Please check your email to verify your account.",
      });
      setCurrentScreen("sign-in");
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      // Don't re-throw, let this function handle the error completely
    }
  };

  const handleResetPassword = async (data: { email: string }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: 'com.brewprint://reset-password',
      });

      if (error) {
        throw error;
      }

      toast.success("Reset email sent!", {
        description: "Please check your email for reset instructions.",
      });
    } catch (error) {
      toast.error("Reset failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      // Don't re-throw, let this function handle the error completely
    }
  };

  const handleForgotPassword = () => {
    setCurrentScreen("forgot-password");
  };

  const handleNavigateToSignIn = () => {
    setCurrentScreen("sign-in");
  };

  const handleNavigateToSignUp = () => {
    setCurrentScreen("sign-up");
  };


  switch (currentScreen) {
    case "sign-up":
      return (
        <SignUp
          onSignUp={handleSignUp}
          onNavigateToSignIn={handleNavigateToSignIn}
        />
      );

    case "forgot-password":
      return (
        <ForgotPassword
          onResetPassword={handleResetPassword}
          onNavigateToSignIn={handleNavigateToSignIn}
        />
      );

    case "sign-in":
    default:
      return (
        <SignIn
          onSignIn={handleSignIn}
          onNavigateToSignUp={handleNavigateToSignUp}
          onForgotPassword={handleForgotPassword}
        />
      );
  }
}

import React, { useState } from "react";

import ForgotPassword from "./forgot-password";
import SignIn from "./sign-in";
import SignUp from "./sign-up";

type AuthScreen = "sign-in" | "sign-up" | "forgot-password";

export default function AuthIndex() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("sign-in");

  const handleSignIn = async (data: { email: string; password: string }) => {
    console.log("Sign in data:", data);
    // TODO: Implement actual authentication logic
  };

  const handleSignUp = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    console.log("Sign up data:", data);
    // TODO: Implement actual registration logic
  };

  const handleResetPassword = async (data: { email: string }) => {
    console.log("Reset password data:", data);
    // TODO: Implement actual password reset logic
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

  const handleTermsPress = () => {
    console.log("Terms of Service pressed");
    // TODO: Navigate to terms of service
  };

  const handlePrivacyPress = () => {
    console.log("Privacy Policy pressed");
    // TODO: Navigate to privacy policy
  };

  switch (currentScreen) {
    case "sign-up":
      return (
        <SignUp
          onSignUp={handleSignUp}
          onNavigateToSignIn={handleNavigateToSignIn}
          onTermsPress={handleTermsPress}
          onPrivacyPress={handlePrivacyPress}
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
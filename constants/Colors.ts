/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Base color palette
const colorPalette = {
  // Primary colors
  primary: "#0a7ea4",
  white: "#ffffff",
  black: "#000000",

  // Light theme colors
  lightText: "#11181C",
  lightBackground: "#ffffff",
  lightBackgroundSecondary: "#f8f9fa",
  lightIcon: "#687076",

  // Dark theme colors
  darkText: "#ECEDEE",
  darkBackground: "#151718",
  darkBackgroundSecondary: "#0a0a0a",
  darkIcon: "#9BA1A6",

  // Semantic colors
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Coffee-specific colors
  coffeeLight: "#d4a574",
  coffeeLightMedium: "#b8935f",
  coffeeMedium: "#8b6d47",
  coffeeMediumDark: "#6b4e37",
  coffeeDark: "#4a3426",

  // Card and surface colors
  cardBackground: "rgba(128, 128, 128, 0.1)",
  cardBackgroundSecondary: "rgba(128, 128, 128, 0.05)",
};

// Theme-specific variables
const tintColorLight = colorPalette.primary;
const tintColorDark = colorPalette.white;

export const Colors = {
  light: {
    text: colorPalette.lightText,
    background: colorPalette.lightBackground,
    backgroundSecondary: colorPalette.lightBackgroundSecondary,
    tint: tintColorLight,
    icon: colorPalette.lightIcon,
    tabIconDefault: colorPalette.lightIcon,
    tabIconSelected: tintColorLight,
    // Semantic colors
    success: colorPalette.success,
    warning: colorPalette.warning,
    error: colorPalette.error,
    info: colorPalette.info,
    // Coffee colors
    coffeeLight: colorPalette.coffeeLight,
    coffeeLightMedium: colorPalette.coffeeLightMedium,
    coffeeMedium: colorPalette.coffeeMedium,
    coffeeMediumDark: colorPalette.coffeeMediumDark,
    coffeeDark: colorPalette.coffeeDark,
    // Card colors
    cardBackground: colorPalette.cardBackground,
    cardBackgroundSecondary: colorPalette.cardBackgroundSecondary,
  },
  dark: {
    text: colorPalette.darkText,
    background: colorPalette.darkBackground,
    backgroundSecondary: colorPalette.darkBackgroundSecondary,
    tint: tintColorDark,
    icon: colorPalette.darkIcon,
    tabIconDefault: colorPalette.darkIcon,
    tabIconSelected: tintColorDark,
    // Semantic colors
    success: colorPalette.success,
    warning: colorPalette.warning,
    error: colorPalette.error,
    info: colorPalette.info,
    // Coffee colors
    coffeeLight: colorPalette.coffeeLight,
    coffeeLightMedium: colorPalette.coffeeLightMedium,
    coffeeMedium: colorPalette.coffeeMedium,
    coffeeMediumDark: colorPalette.coffeeMediumDark,
    coffeeDark: colorPalette.coffeeDark,
    // Card colors
    cardBackground: colorPalette.cardBackground,
    cardBackgroundSecondary: colorPalette.cardBackgroundSecondary,
  },
};

// Export the color palette for direct access when needed
export { colorPalette };

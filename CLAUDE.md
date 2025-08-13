# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brewprint is a Coffee Recipe Tracker - a minimalist React Native app for coffee enthusiasts to perfect their brewing craft. Built with Expo and Supabase, it helps users document, refine, and share coffee recipes with comprehensive tracking of equipment, beans, and brewing parameters.

**🔐 Authentication Required**: Users must create an account and log in to access the app. All brewing data is synced to their personal account.

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `expo start` - Start development server (use this, not npx expo start)
- `expo start --android` - Run on Android emulator
- `expo start --ios` - Run on iOS simulator
- `expo start --web` - Run web version
- `npm run lint` - Run ESLint

### Project Management
- `npm run reset-project` - Reset to blank template (DO NOT USE - will delete coffee app code)

## Database Schema

Complete PostgreSQL database schema designed for Supabase with Row Level Security (RLS). See `@docs/database-schema.md` for full documentation including:

- **9 Core Tables**: profiles, beans, grinders, brewers, water_profiles, brewprints, folders, folder_brewprints, tags
- **User Data Isolation**: All data scoped via `user_id` foreign keys with RLS policies
- **JSONB Flexibility**: Complex brewing parameters, steps, and metrics stored as JSONB
- **Automated Features**: Triggers for timestamps and bean freshness calculations
- **Performance Optimized**: Comprehensive indexes for user queries and relationships

## Architecture

### Silo-Based Organization
The app follows a **silo-based architecture** where each major feature area is self-contained:

- `recipes/` - Recipe CRUD, brewing logic, templates, variations, batch scaling
- `equipment/` - Grinder profiles, brewing methods, calibration tools
- `beans/` - Coffee bean inventory, origin tracking, tasting notes
- `journal/` - Brewing history, analytics, performance metrics
- `settings/` - App preferences, user profile, data export

Each silo contains its own stack navigator, business logic, components, and type definitions.

### Current Structure (Enhanced Expo Template)
- **File-based routing** with Expo Router v5
- **Authentication**: Supabase-powered auth with protected routes
- **Root layout**: `app/_layout.tsx` - Theme provider, auth provider, font loading
- **Auth layout**: `app/(auth)/_layout.tsx` - Sign in, sign up, forgot password flows
- **Tab layout**: `app/(tabs)/_layout.tsx` - Protected bottom navigation with haptic feedback
- **Navigation**: React Navigation v7 with bottom tabs, elements, and native integration
- **Color system**: `constants/Colors.ts` - Light/dark theme support
- **UI Components**: Complete themed component library (see Component Library section)
- **Enhanced UX**: Haptic feedback, blur effects, gesture handling, reanimations

### Planned Architecture Evolution
The current enhanced template structure will be reorganized into the silo-based approach:
- Organize existing React Navigation v7 into stack navigators per silo
- Implement feature-specific folder organization using existing components
- ✅ **Supabase authentication and backend integration complete**
- Replace Expo Symbols with Lucide React Native for consistent iconography
- Migrate to dedicated React Navigation structure (already partially implemented)

## Design System

### Visual Identity
- **Coffee-inspired palette**: Warm caramels, rich browns, cream tones
- **Typography**: Manrope (UI), Playfair Display (headings)
- **Current font**: SpaceMono (will be replaced)
- **Minimalist interface**: Clean, distraction-free experience
- **Icons**: Expo Symbols (current) → Lucide React Native (planned)

### Component Philosophy  
- **Themed components**: Automatic light/dark mode switching across all UI elements
- **No FABs**: Header-based actions for accessibility
- **Contextual actions**: Right action, right place, right time
- **Guided workflows**: Step-by-step processes for complex tasks
- **Form-first design**: React Hook Form integration for data collection
- **Haptic feedback**: Enhanced tactile interactions for brewing workflows

## Component Library

The component library is organized into logical folders for better maintainability and alignment with the silo-based architecture:

### `/components/ui/` - Core UI Components
**Core Themed Components**
- **ThemedView** - Container with automatic theme switching
- **ThemedText** - Typography with theme support

**Form Components (React Hook Form Integration)**
- **ThemedInput** - Text input with validation support
- **ThemedTextArea** - Multi-line text input for notes and descriptions
- **ThemedSelect** - Dropdown/picker for equipment and bean selections
- **ThemedCheckBox** - Checkbox with theme support for preferences
- **ThemedSwitch** - Toggle switch for settings and brewing parameters
- **ThemedLabel** - Form labels with consistent styling

**Interactive Components**
- **ThemedButton** - Primary action button with haptic feedback and enhanced loading states
  - Supports 6 variants: default, destructive, outline, secondary, ghost, link
  - 4 sizes: default, sm, lg, icon
  - Loading state shows spinner + text (not just spinner)
  - Proper color handling for all variants
- **ThemedTabs** - Tab navigation for content organization
- **ThemedBadge** - Status indicators and tags
- **ThemedSeparator** - Visual dividers and section breaks

**Platform Components**
- **HapticTab** - Tab bar items with tactile feedback
- **TabBarBackground** - Platform-specific tab bar styling (iOS blur effects)
- **IconSymbol** - Platform-specific icon rendering
- **Header** - Generic header component with navigation and custom content support

### `/components/` - Generic Utility Components
- **ParallaxScrollView** - Enhanced scrolling experience
- **Collapsible** - Expandable content sections
- **ExternalLink** - External URL handling
- **HelloWave** - Animated welcome component

### `/components/examples/` - Component Examples
- **BrewHeaderExample** - Usage examples for Header component (legacy name)

### Import Patterns
```typescript
// UI components
import { ThemedButton, ThemedInput } from '@/components/ui/ThemedButton';
import { ThemedText, ThemedView } from '@/components/ui/ThemedText';
import { Header } from '@/components/ui/Header';

// Utility components
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Collapsible } from '@/components/Collapsible';
```

## Authentication System

### 🔐 **Complete Authentication Flow**
- **Sign Up**: Email/password with username, Zod validation, email verification
- **Sign In**: Email/password authentication with proper error handling
- **Forgot Password**: Email-based password reset with deep linking support
- **Protected Routes**: Tab navigation requires authentication
- **Session Management**: Persistent sessions with automatic token refresh

### 📱 **Authentication Components**
- `app/(auth)/index.tsx` - Main auth coordinator with centralized toast notifications
- `app/(auth)/sign-in.tsx` - Login form with React Hook Form validation
- `app/(auth)/sign-up.tsx` - Registration form with password confirmation
- `app/(auth)/forgot-password.tsx` - Password reset with email confirmation state
- `context/AuthContext.tsx` - Global authentication state and session management

### 🔒 **Security Features**
- **Route Protection**: Automatic redirect to auth for unauthenticated users
- **Session Persistence**: Secure session storage with AsyncStorage
- **Auto Navigation**: Smart routing based on authentication state
- **Loading States**: Proper loading indicators during auth operations
- **Error Handling**: Centralized error management with user-friendly messages

### 🎯 **User Experience**
- **Centralized Notifications**: Single toast per action (no duplicates)
- **Enhanced Loading States**: Buttons show spinner + text during operations
- **Form Validation**: Real-time validation with clear error messages
- **Smooth Transitions**: Seamless navigation between auth states
- **Account Management**: Sign out functionality with confirmation dialog

## Key Features to Implement

### Core Features
1. **Recipe Management**: Create, edit, test, iterate, and share detailed brewing recipes
2. **Equipment Tracking**: Grinder profiles, brewing method settings, calibration
3. **Bean Library**: Origin tracking, tasting notes, inventory management
4. **Brewing Assistant**: Guided timer with parameter tracking and extraction analysis
5. **Journal & Analytics**: Complete brew history with performance metrics

### Technical Integration
- **Supabase**: ✅ Database, authentication, real-time sync implemented
- **Authentication**: ✅ Complete auth flow with email/password, forgot password, protected routes
- **State Management**: React Context + useReducer (not Redux)
- **Form Management**: ✅ React Hook Form for data collection and validation
- **Notifications**: ✅ Sonner Native for toast notifications (centralized, no duplicates)
- **Offline-First**: Core functionality must work without internet
- **Cross-Platform**: iOS, Android, and Web support
- **Enhanced UX**: ✅ Haptic feedback, blur effects, gesture handling, smooth animations

## Development Guidelines

### Code Standards
- **TypeScript Only**: No JavaScript files allowed
- **Functional Components**: No class components
- **Separation of Concerns**: UI and business logic separated
- **Naming Conventions**: camelCase for files, PascalCase for components
- **Theme Colors**: Always use `@constants/Colors.ts` with `useColorScheme()` hook for theme-aware colors. Never hardcode color values.
- **Authentication**: Always use `useAuth()` hook for authentication state, never access Supabase client directly in components
- **Error Handling**: Centralize toast notifications in parent components, avoid duplicate error messages
- **Loading States**: Use ThemedButton's built-in loading prop for consistent UX

### Project Status
Currently in **Authentication Complete Phase**:
- ✅ Complete themed component library implemented
- ✅ React Navigation v7 integrated with Expo Router
- ✅ Form handling with React Hook Form ready
- ✅ Enhanced UX features (haptics, animations, blur effects) integrated
- ✅ **Supabase authentication system fully implemented**
- ✅ **Protected routes and auth context management**
- ✅ **Enhanced ThemedButton with proper loading states**
- ✅ **Centralized toast notifications (no duplicates)**
- Need to implement silo-based architecture using existing components
- Core type definitions required
- Theme system needs coffee-inspired color palette
- Ready to build coffee-specific features

### Technology Stack

#### Core Framework
- **Framework**: React Native (Expo SDK ~53.0.20)
- **Language**: TypeScript 5.8.3 (strict mode)
- **Routing**: Expo Router v5 with React Navigation v7 integration

#### Navigation & UX
- **Navigation**: React Navigation v7 (bottom tabs, elements, native integration)
- **Gestures**: react-native-gesture-handler v2.24
- **Animations**: react-native-reanimated v3.17
- **Haptics**: expo-haptics for tactile feedback
- **Visual Effects**: expo-blur for iOS-native blur effects

#### Form & State Management
- **Forms**: React Hook Form v7.62 for data collection and validation
- **State**: React Context + useReducer (not Redux)
- **Notifications**: Sonner Native v0.21 for toast notifications

#### UI & Assets
- **Styling**: StyleSheet + Theme system (no external styling libraries)
- **Icons**: Expo Symbols v0.4 → migrate to Lucide React Native
- **Images**: expo-image v2.4 for optimized image handling
- **Fonts**: expo-font v13.3 for typography management

#### Backend & Authentication
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Authentication**: Supabase Auth with email/password, password reset
- **Storage**: AsyncStorage for session persistence
- **Auth Context**: Global authentication state management

#### Platform Integration
- **System UI**: expo-system-ui for status bar and navigation bar
- **Safe Areas**: react-native-safe-area-context for screen boundaries
- **Web Support**: react-native-web v0.20 for cross-platform compatibility
- **WebView**: react-native-webview v13.13 for embedded web content

## Important Notes

- This is a specialty coffee app, not a generic template project
- Focus on coffee enthusiast workflows and brewing precision
- **Authentication is mandatory** - all users must create accounts to access the app
- **Supabase Environment**: Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` environment variables
- **Database Setup**: Reference `@docs/database-schema.md` for complete schema documentation
- Offline-first architecture is crucial for kitchen/brewing environment usage (post-authentication)
- The reset-project script should NOT be used as it will delete the coffee app code
- **Toast Management**: Always use centralized toast notifications to prevent duplicates
- **Auth Context**: Use `useAuth()` hook for all authentication-related operations

### Files to Ignore
- `@docs/tables-creation-query.md` - Raw SQL creation queries (for reference only)

### Environment Setup
```bash
# Required environment variables in .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Authentication Development Notes
- **Route Protection**: All main app routes are protected and require authentication
- **Session Management**: Sessions persist across app restarts using AsyncStorage
- **Error Handling**: Authentication errors are centralized in `app/(auth)/index.tsx`
- **Loading States**: All auth forms use ThemedButton with proper loading feedback
- **Navigation**: Automatic routing between auth and main app based on session state
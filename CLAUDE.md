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

## Security Implementation

### 🔒 Row Level Security (RLS)

**CRITICAL**: RLS must be enabled on ALL tables to prevent data leaks.

```sql
-- Enable on all tables (run immediately after table creation)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grinders ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_brewprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
```

### 🛡️ Security Features

- **User Isolation**: Complete data isolation via user_id foreign keys and RLS policies
- **Input Validation**: Zod schemas with DOMPurify sanitization for all user inputs
- **Rate Limiting**: Database-level and client-side protection against abuse
- **Secure Storage**: Expo SecureStore with AES encryption for sensitive data
- **Session Management**: Automatic refresh, 5-minute validation intervals, PKCE flow
- **Audit Logging**: Comprehensive tracking of sensitive operations
- **JSONB Sanitization**: Automatic XSS protection for complex JSON fields
- **File Upload Security**: Type validation, size limits, user-scoped storage buckets

### 🚨 Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] No public access without explicit policies
- [ ] Input validation with Zod on all user inputs
- [ ] Secure storage (SecureStore) for sensitive data
- [ ] Environment variables properly configured
- [ ] Service role key NEVER exposed to client
- [ ] Rate limiting implemented (50 ops/minute DB, 10 requests/minute API)
- [ ] Session timeout configured (30 minutes)
- [ ] MFA available for sensitive operations
- [ ] Regular security audits scheduled
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging configured (no PII in logs)
- [ ] HTTPS/TLS enforced everywhere
- [ ] Dependencies regularly updated
- [ ] Backup and recovery plan in place

### 🔑 Environment Variables

```bash
# Required in .env (NEVER commit this file)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

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
- **Security**: Complete RLS implementation, input validation, secure storage

### Planned Architecture Evolution

The current enhanced template structure will be reorganized into the silo-based approach:

- Organize existing React Navigation v7 into stack navigators per silo
- Implement feature-specific folder organization using existing components
- ✅ **Supabase authentication and backend integration complete**
- ✅ **Security implementation complete with RLS and validation**
- Replace Expo Symbols with Lucide React Native for consistent iconography
- Migrate to dedicated React Navigation structure (already partially implemented)

## Design System

### Visual Identity - Dark Scheduler Theme

- **Primary Color Palette**: Modern dark scheduler interface with purple accents
  - `background` (#0f0f10) - Primary dark background
  - `surface` (#1a1a1c) - Card and surface backgrounds
  - `cardBackground` (#1f1f23) - Individual card backgrounds
  - `cardSecondary` (#2a2a2e) - Secondary card elements
  - `primary` (#6d28d9) - Purple primary accent
  - `accent` (#8b5cf6) - Purple accent for highlights
  - `progressTrack` (#333338) - Progress bar backgrounds
  - `progressActive` (#ffffff) - Active progress indicators
  - `statusGreen` (#22c55e) - Status indicator green

- **Typography Colors**:
  - `text` (#ffffff) - Primary white text
  - `textSecondary` (#a0a0a0) - Secondary light gray text
  - `textTertiary` (#6c6c70) - Tertiary darker gray text

- **Navigation & Interface**:
  - `tint` (#8b5cf6) - Tab bar active tint
  - `icon` (#a0a0a0) - Icon color
  - `border` (#2d2d30) - Borders and dividers

- **Semantic Colors**: Success (#10b981), warning (#f59e0b), error (#ef4444)
- **Gradient System**: Featured cards use purple gradients (gradientStart to gradientEnd)
- **Card Hierarchy**: Progress cards with priority indicators and featured styling
- **Typography**: Clean, modern typography with consistent spacing
- **Icons**: Expo Symbols with coffee and scheduler-appropriate iconography

### Component Philosophy - Scheduler Interface

- **Dark-First Design**: All components designed for dark theme by default
- **Scheduler-Style Headers**: Hamburger menu, profile avatar, search functionality
- **Progress Cards**: Main content display with progress bars, status indicators, and priority badges
- **Search & Filter**: Consistent search bar with filter button across screens
- **Card-Based Layout**: All content organized in rounded cards with consistent spacing
- **Priority System**: Visual priority indicators with numbered badges
- **Status Tracking**: Progress bars with dot indicators showing completion states
- **Inventory Management**: Coffee-specific progress tracking (beans, brewing, equipment)
- **Horizontal Information**: Label-value pairs with icons for efficient space usage
- **Interactive Elements**: Touch-optimized cards with proper feedback

## Component Library

The component library is organized into logical folders for better maintainability and alignment with the silo-based architecture:

### `/components/ui/` - Core UI Components

**Core Themed Components**

- **ThemedView** - Container with automatic dark theme switching
- **ThemedText** - Typography with dark theme support
- **ThemedScrollView** - Scrollable container with dark theme-aware styling

**Scheduler Interface Components**

- **ProgressCard** - Main content card component matching scheduler design
  - Progress bars with dot indicators
  - Priority badges with numbered indicators
  - Featured cards with purple gradients
  - Coffee-specific stat labels (beans in stock, currently brewing, brews planned)
  - Touch-optimized with proper feedback
  
- **SearchBar** - Search input with filter button
  - Dark theme styling with card background
  - Consistent with scheduler interface
  - Filter button integration
  
- **Header** - Enhanced header component with scheduler options
  - Supports scheduler-style layout (hamburger menu + profile avatar)
  - Search button integration
  - Maintains original functionality for other screens
  - Coffee-themed titles and subtitles

**Form Components (React Hook Form Integration)**

- **ThemedInput** - Text input with validation support and dark theme styling
- **ThemedTextArea** - Multi-line text input for notes and descriptions
- **ThemedSelect** - Dropdown/picker for equipment and bean selections
- **ThemedCheckBox** - Checkbox with dark theme support for preferences
- **ThemedSwitch** - Toggle switch for settings and brewing parameters
- **ThemedLabel** - Form labels with consistent dark styling

**Interactive Components**

- **ThemedButton** - Primary action button with haptic feedback and enhanced loading states
  - Supports 6 variants: default, destructive, outline, secondary, ghost, link
  - 4 sizes: default, sm, lg, icon
  - Loading state shows spinner + text (not just spinner)
  - Dark theme color handling for all variants
- **ThemedTabs** - Tab navigation for content organization with dark theme support
- **ThemedBadge** - Status indicators and semantic color badges
  - Supports 6 variants: default, secondary, destructive, success, warning, outline
  - 3 sizes: default, sm, lg
  - Automatic text color optimization for dark theme readability
- **ThemedSeparator** - Visual dividers and section breaks

**Platform Components**

- **HapticTab** - Tab bar items with tactile feedback (dark theme)
- **TabBarBackground** - Platform-specific tab bar styling with dark backgrounds
- **IconSymbol** - Platform-specific icon rendering with dark theme colors

### `/components/beans/` - Coffee Bean Components

- **StatusCards** - Single horizontal row with roast level (dot + text), freshness badge, and days since roast
- **DescriptionCard** - Compact card with integrated title and description text, 12px padding
- **InfoSection** - Horizontal label-value pairs with icons, compact 12px padding layout
- **InventoryCard** - Compact inventory display with horizontal label-value and borderless progress bar
- **RatingSection** - Coffee rating with custom circle design (outer ring + inner circle, no color coding)
- **TastingNotes** - Compact card with small badges for taste descriptors, 12px padding
- **bean-card** - Individual bean card component for lists with minimalist design

### `/components/screens/` - Screen-Specific Components

- **home/beans-section.tsx** - Home screen beans section layout

### `/components/` - Generic Utility Components

- **ParallaxScrollView** - Enhanced scrolling experience
- **Collapsible** - Expandable content sections
- **ExternalLink** - External URL handling
- **HelloWave** - Animated welcome component

### `/components/examples/` - Component Examples

- **BrewHeaderExample** - Usage examples for Header component (legacy name)

### Import Patterns

```typescript
// Scheduler UI components
import { ProgressCard } from '@/components/ui/ProgressCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Header } from '@/components/ui/Header';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { ThemedText, ThemedView } from '@/components/ui/ThemedText';
import { ThemedScrollView } from '@/components/ui/ThemedScrollView';

// Coffee-specific components
import { StatusCards } from '@/components/beans/StatusCards';
import { bean-card } from '@/components/beans/bean-card';

// Utility components
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Collapsible } from '@/components/Collapsible';

// Dark theme color system
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

// Example scheduler interface usage
const MyScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Bean Library"
        subtitle="Coffee Bean Inventory"
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={true}
      />
      
      <SearchBar 
        placeholder="Search beans..."
        onSearch={handleSearch}
        onFilterPress={handleFilter}
      />
      
      <ProgressCard
        title="Ethiopian Yirgacheffe"
        subtitle="Light Roast - Floral Notes"
        itemsInStock={450}
        awaitingStock={50}
        demand={3}
        priority={1}
        featured={true}
      />
    </ThemedView>
  );
};
```

## Authentication System

### 🔐 **Complete Authentication Flow**

- **Sign Up**: Email/password with username, Zod validation, email verification
- **Sign In**: Email/password authentication with proper error handling
- **Forgot Password**: Email-based password reset with deep linking support
- **Protected Routes**: Tab navigation requires authentication
- **Session Management**: Persistent sessions with automatic token refresh
- **Security**: PKCE flow for mobile, session validation every 5 minutes

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
- **Session Validation**: Automatic session checks every 5 minutes
- **Secure Storage**: Sensitive data encrypted with AES via Expo SecureStore

### 🎯 **User Experience**

- **Centralized Notifications**: Single toast per action (no duplicates)
- **Enhanced Loading States**: Buttons show spinner + text during operations
- **Form Validation**: Real-time validation with clear error messages
- **Smooth Transitions**: Seamless navigation between auth states
- **Account Management**: Sign out functionality with confirmation dialog

## Security Services & Utilities

### `/lib/supabase.ts` - Secure Supabase Client

- PKCE flow for enhanced mobile security
- Automatic token refresh
- Rate-limited realtime subscriptions
- Session persistence with AsyncStorage

### `/utils/validation.ts` - Input Validation Schemas

- **beanSchema**: Validates coffee bean data (name, roast level, weight, price)
- **brewprintSchema**: Validates brewing recipes (weights, time, temperature)
- **usernameSchema**: Profile username validation (3-20 chars, alphanumeric)
- DOMPurify sanitization on all text inputs

### `/services/api.ts` - Secure API Service

- Client-side rate limiting (10 requests/minute)
- Automatic session refresh before API calls
- Paginated queries to prevent large data fetches
- Zod validation before database operations

### `/utils/secureStorage.ts` - Encrypted Storage

- AES-256 encryption for sensitive data
- Singleton pattern for consistent key management
- Secure key generation and storage
- Automatic encryption/decryption

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
- **Security**: ✅ RLS policies, input validation, secure storage, rate limiting
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

#### Dark Scheduler Theme Standards

- **Dark Theme Colors**: Always use `@constants/Colors.ts` with `useThemeColor()` hook defaulting to dark theme. Never hardcode color values.
  - **Primary Colors**: Use `primary` (#6d28d9), `accent` (#8b5cf6) for purple scheduler theme
  - **Background Colors**: Use `background` (#0f0f10), `surface` (#1a1a1c), `cardBackground` (#1f1f23)
  - **Text Colors**: Use `text` (#ffffff), `textSecondary` (#a0a0a0), `textTertiary` (#6c6c70)
  - **Progress Elements**: Use `progressTrack` (#333338), `progressActive` (#ffffff), `statusGreen` (#22c55e)
  - **Semantic colors**: Use `success`, `warning`, `error` for status indicators

#### Scheduler Interface Standards

- **Header Design**: Use scheduler-style headers with hamburger menu, profile avatar, and search functionality
- **Card Layout**: Use ProgressCard component for main content with progress bars, priority badges, and featured gradients
- **Search Integration**: Include SearchBar with filter button on inventory and listing screens
- **Progress Indicators**: Show progress bars with dot indicators and coffee-specific statistics
- **Priority System**: Use numbered priority badges with green status indicators
- **Information Display**: Use horizontal label-value pairs with icons for space efficiency
- **Touch Optimization**: Ensure cards and interactive elements are touch-optimized with proper feedback

#### Coffee App Standards

- **Authentication**: Always use `useAuth()` hook for authentication state, never access Supabase client directly in components
- **Error Handling**: Centralize toast notifications in parent components, avoid duplicate error messages
- **Loading States**: Use ThemedButton's built-in loading prop for consistent UX
- **Component Styling**: Follow dark scheduler design with 16px card padding and consistent border radius
- **Coffee Context**: Use coffee-appropriate terminology (beans in stock, currently brewing, brews planned)
- **Inventory Tracking**: Display quantities in grams for beans, units for equipment
- **ThemedView Background**: Use `noBackground` prop when ThemedView is used purely for layout without visual styling

### Security Best Practices

- **Never expose service role keys** in client code
- **Always validate user input** with Zod schemas before database operations
- **Use SecureStore** for sensitive data, not AsyncStorage
- **Implement rate limiting** on both client and database levels
- **Sanitize all text inputs** with DOMPurify
- **Enable RLS on all tables** immediately after creation
- **Use parameterized queries** (Supabase handles automatically)
- **Audit sensitive operations** with database triggers
- **Validate file uploads** (type, size, user ownership)
- **Refresh sessions regularly** (5-minute intervals)

### Project Status

Currently in **Dark Scheduler Design Implementation Complete Phase**:

#### ✅ **Dark Scheduler Interface Complete**
- ✅ **Complete dark theme color system with purple accents**
- ✅ **ProgressCard component matching reference scheduler design**
- ✅ **SearchBar component with filter integration**
- ✅ **Enhanced Header component with hamburger menu + profile avatar**
- ✅ **All screens updated to scheduler interface (Home, Recipes, Beans, Equipment, Settings)**
- ✅ **Consistent dark navigation with coffee-themed tabs**
- ✅ **Progress tracking for coffee inventory management**
- ✅ **Priority indicators and featured card gradients**
- ✅ **Coffee-specific terminology and data display**

#### ✅ **Technical Foundation Complete**
- ✅ **Complete themed component library with dark scheduler styling**
- ✅ **React Navigation v7 integrated with Expo Router**
- ✅ **Form handling with React Hook Form ready**
- ✅ **Enhanced UX features (haptics, animations, blur effects) integrated**
- ✅ **Supabase authentication system fully implemented**
- ✅ **Protected routes and auth context management**
- ✅ **Enhanced ThemedButton with proper loading states**
- ✅ **ThemedBadge with semantic color variants**
- ✅ **Centralized toast notifications (no duplicates)**
- ✅ **ThemedView with noBackground prop for layout flexibility**
- ✅ **Complete security implementation with RLS, validation, and secure storage**
- ✅ **Rate limiting and audit logging configured**
- ✅ **Session management with automatic refresh**

#### 🔄 **Next Phase: Feature Development**
- Need to implement silo-based architecture using existing scheduler components
- Core type definitions required for coffee data models
- Ready to build remaining coffee-specific features using ProgressCard design pattern
- Integrate real coffee data with existing scheduler interface components

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
- **Validation**: Zod for schema validation
- **Sanitization**: DOMPurify for XSS protection
- **State**: React Context + useReducer (not Redux)
- **Notifications**: Sonner Native v0.21 for toast notifications

#### UI & Assets

- **Styling**: StyleSheet + Theme system (no external styling libraries)
- **Icons**: Expo Symbols v0.4 → migrate to Lucide React Native
- **Images**: expo-image v2.4 for optimized image handling
- **Fonts**: expo-font v13.3 for typography management

#### Backend & Authentication

- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Authentication**: Supabase Auth with email/password, password reset, PKCE flow
- **Storage**: AsyncStorage for session persistence
- **Secure Storage**: Expo SecureStore for sensitive data encryption
- **Auth Context**: Global authentication state management with session validation

#### Security & Performance

- **RLS**: Row Level Security on all database tables
- **Rate Limiting**: Client-side and database-level protection
- **Input Validation**: Zod schemas with DOMPurify sanitization
- **Audit Logging**: Database triggers for sensitive operations
- **Session Management**: 5-minute validation intervals, automatic refresh
- **Encryption**: AES-256 for sensitive local storage

#### Platform Integration

- **System UI**: expo-system-ui for status bar and navigation bar
- **Safe Areas**: react-native-safe-area-context for screen boundaries
- **Web Support**: react-native-web v0.20 for cross-platform compatibility
- **WebView**: react-native-webview v13.13 for embedded web content

## Important Notes

- This is a specialty coffee app, not a generic template project
- Focus on coffee enthusiast workflows and brewing precision
- **Authentication is mandatory** - all users must create accounts to access the app
- **Security is critical** - RLS must be enabled on all tables, input validation is required
- **Supabase Environment**: Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` environment variables
- **Database Setup**: Reference `@docs/database-schema.md` for complete schema documentation
- Offline-first architecture is crucial for kitchen/brewing environment usage (post-authentication)
- The reset-project script should NOT be used as it will delete the coffee app code
- **Toast Management**: Always use centralized toast notifications to prevent duplicates
- **Auth Context**: Use `useAuth()` hook for all authentication-related operations
- **Security Context**: Never expose service keys, always validate input, use SecureStore for sensitive data

### Files to Ignore

- `@docs/tables-creation-query.md` - Raw SQL creation queries (for reference only)

### Environment Setup

```bash
# Required environment variables in .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only (NEVER expose in client)
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Authentication Development Notes

- **Route Protection**: All main app routes are protected and require authentication
- **Session Management**: Sessions persist across app restarts using AsyncStorage
- **Error Handling**: Authentication errors are centralized in `app/(auth)/index.tsx`
- **Loading States**: All auth forms use ThemedButton with proper loading feedback
- **Navigation**: Automatic routing between auth and main app based on session state

### Security Development Notes

- **RLS First**: Always enable RLS immediately after creating tables
- **Validate Everything**: Use Zod schemas for all user inputs
- **Rate Limit**: Implement both client and database-level rate limiting
- **Audit Important Actions**: Log sensitive operations for security monitoring
- **Secure Storage**: Use SecureStore for tokens, keys, and sensitive data
- **Session Hygiene**: Validate sessions regularly, refresh tokens proactively
- **Error Messages**: Never leak sensitive information in error responses
- **File Uploads**: Always validate type, size, and ownership

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brewprint is a Coffee Recipe Tracker - a minimalist React Native app for coffee enthusiasts to perfect their brewing craft. Built with Expo, it helps users document, refine, and share coffee recipes with comprehensive tracking of equipment, beans, and brewing parameters.

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
- **Root layout**: `app/_layout.tsx` - Theme provider, font loading
- **Tab layout**: `app/(tabs)/_layout.tsx` - Bottom navigation with haptic feedback
- **Navigation**: React Navigation v7 with bottom tabs, elements, and native integration
- **Color system**: `constants/Colors.ts` - Light/dark theme support
- **UI Components**: Complete themed component library (see Component Library section)
- **Enhanced UX**: Haptic feedback, blur effects, gesture handling, reanimations

### Planned Architecture Evolution
The current enhanced template structure will be reorganized into the silo-based approach:
- Organize existing React Navigation v7 into stack navigators per silo
- Implement feature-specific folder organization using existing components
- Add Supabase for backend data sync
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
- **ThemedButton** - Primary action button with haptic feedback
- **ThemedTabs** - Tab navigation for content organization
- **ThemedBadge** - Status indicators and tags
- **ThemedSeparator** - Visual dividers and section breaks

**Platform Components**
- **HapticTab** - Tab bar items with tactile feedback
- **TabBarBackground** - Platform-specific tab bar styling (iOS blur effects)
- **IconSymbol** - Platform-specific icon rendering

### `/components/coffee/` - Coffee-Specific Components
- **BrewHeader** - Coffee-specific header component with brewing context

### `/components/` - Generic Utility Components
- **ParallaxScrollView** - Enhanced scrolling experience
- **Collapsible** - Expandable content sections
- **ExternalLink** - External URL handling
- **HelloWave** - Animated welcome component

### `/components/examples/` - Component Examples
- **BrewHeaderExample** - Usage examples for BrewHeader component

### Import Patterns
```typescript
// UI components
import { ThemedButton, ThemedInput } from '@/components/ui/ThemedButton';
import { ThemedText, ThemedView } from '@/components/ui/ThemedText';

// Coffee-specific components
import { BrewHeader } from '@/components/coffee/BrewHeader';

// Utility components
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Collapsible } from '@/components/Collapsible';
```

## Key Features to Implement

### Core Features
1. **Recipe Management**: Create, edit, test, iterate, and share detailed brewing recipes
2. **Equipment Tracking**: Grinder profiles, brewing method settings, calibration
3. **Bean Library**: Origin tracking, tasting notes, inventory management
4. **Brewing Assistant**: Guided timer with parameter tracking and extraction analysis
5. **Journal & Analytics**: Complete brew history with performance metrics

### Technical Integration
- **Supabase**: Database, authentication, real-time sync (planned)
- **State Management**: React Context + useReducer (not Redux)
- **Form Management**: React Hook Form for data collection and validation
- **Notifications**: Sonner Native for toast notifications and brewing alerts
- **Offline-First**: Core functionality must work without internet
- **Cross-Platform**: iOS, Android, and Web support
- **Enhanced UX**: Haptic feedback, blur effects, gesture handling, smooth animations

## Development Guidelines

### Code Standards
- **TypeScript Only**: No JavaScript files allowed
- **Functional Components**: No class components
- **Separation of Concerns**: UI and business logic separated
- **Naming Conventions**: camelCase for files, PascalCase for components

### Project Status
Currently in **Enhanced Foundation Phase**:
- Complete themed component library implemented
- React Navigation v7 integrated with Expo Router
- Form handling with React Hook Form ready
- Enhanced UX features (haptics, animations, blur effects) integrated
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

#### Platform Integration
- **System UI**: expo-system-ui for status bar and navigation bar
- **Safe Areas**: react-native-safe-area-context for screen boundaries
- **Web Support**: react-native-web v0.20 for cross-platform compatibility
- **WebView**: react-native-webview v13.13 for embedded web content

## Important Notes

- This is a specialty coffee app, not a generic template project
- Focus on coffee enthusiast workflows and brewing precision
- Offline-first architecture is crucial for kitchen/brewing environment usage
- The reset-project script should NOT be used as it will delete the coffee app code
- Follow the detailed architectural guidelines in `/docs/rules.md` (when created)
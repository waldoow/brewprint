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

### Current Structure (Expo Template Base)
- **File-based routing** with Expo Router v5
- **Root layout**: `app/_layout.tsx` - Theme provider, font loading
- **Tab layout**: `app/(tabs)/_layout.tsx` - Bottom navigation
- **Themed components**: `components/ThemedText.tsx`, `components/ThemedView.tsx`
- **Color system**: `constants/Colors.ts` - Light/dark theme support

### Planned Architecture Evolution
The current Expo template structure will be reorganized into the silo-based approach:
- Move from file-based routing to React Navigation v6 stack navigators per silo
- Implement feature-specific folder organization
- Add Supabase for backend data sync
- Integrate Lucide React Native for iconography

## Design System

### Visual Identity
- **Coffee-inspired palette**: Warm caramels, rich browns, cream tones
- **Typography**: Manrope (UI), Playfair Display (headings)
- **Current font**: SpaceMono (will be replaced)
- **Minimalist interface**: Clean, distraction-free experience

### Component Philosophy  
- **Themed components**: Automatic light/dark mode switching
- **No FABs**: Header-based actions for accessibility
- **Contextual actions**: Right action, right place, right time
- **Guided workflows**: Step-by-step processes for complex tasks

## Key Features to Implement

### Core Features
1. **Recipe Management**: Create, edit, test, iterate, and share detailed brewing recipes
2. **Equipment Tracking**: Grinder profiles, brewing method settings, calibration
3. **Bean Library**: Origin tracking, tasting notes, inventory management
4. **Brewing Assistant**: Guided timer with parameter tracking and extraction analysis
5. **Journal & Analytics**: Complete brew history with performance metrics

### Technical Integration
- **Supabase**: Database, authentication, real-time sync
- **State Management**: React Context + useReducer (not Redux)
- **Offline-First**: Core functionality must work without internet
- **Cross-Platform**: iOS, Android, and Web support

## Development Guidelines

### Code Standards
- **TypeScript Only**: No JavaScript files allowed
- **Functional Components**: No class components
- **Separation of Concerns**: UI and business logic separated
- **Naming Conventions**: camelCase for files, PascalCase for components

### Project Status
Currently in **Foundation Phase**:
- Basic Expo template structure in place
- Need to implement silo-based architecture
- Core type definitions required
- Theme system needs coffee-inspired color palette
- Navigation architecture planning required

### Technology Stack
- **Framework**: React Native (Expo SDK ~53.0)
- **Language**: TypeScript 5.8.3 (strict mode)
- **Current Navigation**: Expo Router v5 → migrate to React Navigation v6
- **Styling**: StyleSheet + Theme system (no external styling libraries)
- **Icons**: Expo Symbols → migrate to Lucide React Native

## Important Notes

- This is a specialty coffee app, not a generic template project
- Focus on coffee enthusiast workflows and brewing precision
- Offline-first architecture is crucial for kitchen/brewing environment usage
- The reset-project script should NOT be used as it will delete the coffee app code
- Follow the detailed architectural guidelines in `/docs/rules.md` (when created)
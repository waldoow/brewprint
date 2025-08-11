# 🏗️ Architecture

Brewprint follows a **silo-based architecture** where each major feature area is self-contained with its own navigation, business logic, components, and type definitions.

## Silo-Based Organization

### Current Structure (Transition Phase)
The app is currently using Expo Router v5 but will migrate to React Navigation v6 with silo-based organization:

```
app/
├── (tabs)/                  # Current tab-based routing
│   ├── _layout.tsx         # Bottom navigation
│   ├── index.tsx           # Home screen  
│   ├── library.tsx         # Library screen
│   ├── folders.tsx         # Folders screen
│   └── settings.tsx        # Settings screen
├── _layout.tsx             # Root layout with theme
└── +not-found.tsx          # 404 handler
```

### Target Architecture (Silo-Based)
```
features/
├── recipes/                # Recipe management silo
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── types/
│   └── utils/
├── equipment/              # Equipment tracking silo
├── beans/                  # Bean inventory silo  
├── journal/                # Brewing history silo
└── settings/               # App preferences silo
```

## Silo Breakdown

### 🧪 Recipes Silo
**Purpose:** Recipe CRUD, brewing logic, templates, variations, batch scaling

**Components:**
- Recipe creation and editing forms
- Brewing timer and assistant
- Recipe templates and variations
- Batch scaling calculator

**Navigation:** Stack navigator for recipe workflows

### ⚙️ Equipment Silo  
**Purpose:** Grinder profiles, brewing methods, calibration tools

**Components:**
- Equipment inventory management
- Grinder profile configuration
- Brewing method settings
- Calibration and maintenance tracking

**Navigation:** Stack navigator with equipment categories

### ☕ Beans Silo
**Purpose:** Coffee bean inventory, origin tracking, tasting notes

**Components:**
- Bean inventory management  
- Origin and farm information
- Tasting notes and cupping scores
- Purchase history and costs

**Navigation:** Stack navigator with bean management flows

### 📊 Journal Silo
**Purpose:** Brewing history, analytics, performance metrics

**Components:**
- Brewing session history
- Performance analytics dashboard
- Success rate tracking
- Recipe improvement suggestions

**Navigation:** Stack navigator with analytics views

### ⚙️ Settings Silo
**Purpose:** App preferences, user profile, data export

**Components:**
- User preferences and settings
- Profile management
- Data export and backup
- Theme and accessibility options

**Navigation:** Stack navigator with settings categories

## Technical Architecture

### Navigation Strategy
```typescript
// Target navigation structure
const RootNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="TabNavigator" component={TabNavigator} />
    <Stack.Screen name="RecipesStack" component={RecipesNavigator} />
    <Stack.Screen name="EquipmentStack" component={EquipmentNavigator} />
    <Stack.Screen name="BeansStack" component={BeansNavigator} />
    <Stack.Screen name="JournalStack" component={JournalNavigator} />
  </Stack.Navigator>
);
```

### State Management Philosophy
- **React Context + useReducer** (not Redux)
- **Silo-specific contexts** for feature isolation
- **Shared context** for app-wide state (theme, user)
- **Offline-first** approach with local storage

### Component Architecture
```
components/
├── shared/                 # Cross-silo components
│   ├── BrewHeader.tsx     # Customizable header
│   ├── ThemedText.tsx     # Theme-aware text
│   └── ThemedView.tsx     # Theme-aware view
├── ui/                    # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
└── [silo]/                # Silo-specific components
    ├── RecipeCard.tsx
    └── BrewTimer.tsx
```

## Current Implementation Details

### Theme System
- **Colors:** `constants/Colors.ts` with light/dark support
- **Typography:** Currently SpaceMono (planned: Manrope + Playfair Display)
- **Components:** ThemedText and ThemedView for automatic theme switching

### File-Based Routing (Current)
- **Expo Router v5** with automatic route generation
- **Tab layout** in `app/(tabs)/_layout.tsx`
- **Screen files** directly in tabs folder

### Custom Components
- **BrewHeader:** Flexible header with customizable content
- **Themed Components:** Automatic light/dark mode support
- **Icon System:** Expo Symbols (planned: Lucide React Native)

## Migration Plan

### Phase 1: Foundation (Current)
- ✅ Basic Expo template structure
- ✅ Theme system with coffee-inspired colors
- ✅ Custom header component
- ⏳ Core type definitions

### Phase 2: Navigation Migration
- 📋 Install React Navigation v6
- 📋 Create silo-based navigators
- 📋 Migrate from Expo Router
- 📋 Implement deep linking

### Phase 3: Feature Implementation  
- 📋 Recipe management silo
- 📋 Equipment tracking silo
- 📋 Bean inventory silo
- 📋 Journal and analytics silo

### Phase 4: Backend Integration
- 📋 Supabase integration
- 📋 Authentication system
- 📋 Real-time sync
- 📋 Offline-first data layer

## Design Principles

### Separation of Concerns
- **UI Components:** Pure presentation logic
- **Business Logic:** Isolated in custom hooks and utilities  
- **Navigation:** Feature-specific stack navigators
- **State:** Context providers per silo

### Code Organization
- **TypeScript Only:** No JavaScript files allowed
- **Functional Components:** No class components
- **camelCase:** For files and variables
- **PascalCase:** For components and types

### Performance Considerations
- **Lazy Loading:** Silo-based code splitting
- **Memoization:** Expensive calculations cached
- **Offline-First:** Core functionality without internet
- **Bundle Optimization:** Platform-specific builds

## Technology Stack

| Layer | Current | Planned |
|-------|---------|---------|
| **Framework** | React Native + Expo SDK ~53.0 | Same |
| **Language** | TypeScript 5.8.3 | Same |  
| **Navigation** | Expo Router v5 | React Navigation v6 |
| **Styling** | StyleSheet + Theme | Same |
| **Icons** | Expo Symbols | Lucide React Native |
| **Backend** | None | Supabase |
| **State** | useState/useEffect | Context + useReducer |
| **Testing** | None | Jest + Testing Library |

---

**Next:** Learn about the component system in the [Components Guide](./components.md).
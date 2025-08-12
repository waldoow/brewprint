# 💻 Development

This guide covers development workflows, code standards, testing guidelines, and best practices for contributing to Brewprint.

## Development Workflow

### Getting Started
1. **Setup Development Environment** → [Getting Started Guide](./getting-started.md)
2. **Understand Architecture** → [Architecture Guide](./architecture.md)
3. **Review Component Patterns** → [Components Guide](./components.md)
4. **Follow Code Standards** (below)

### Daily Development Flow
```bash
# 1. Start development server
expo start

# 2. Choose platform
# Press 'i' for iOS, 'a' for Android, 'w' for web

# 3. Code with hot reloading
# Changes appear instantly on device/simulator

# 4. Run linting before commits
npm run lint

# 5. Test on multiple platforms
expo start --ios
expo start --android
expo start --web
```

## Code Standards

### TypeScript Requirements
- **Strict mode enabled:** All files must pass TypeScript strict checks
- **No JavaScript files:** Only `.ts` and `.tsx` files allowed
- **Explicit typing:** Avoid `any` type, prefer specific interfaces
- **Type exports:** Export interfaces for reusable types

```typescript
// ✅ Good - Explicit interface
interface RecipeProps {
  name: string;
  method: BrewMethod;
  grindSize: GrindSize;
  onPress?: () => void;
}

// ❌ Bad - Using any
const handleData = (data: any) => { ... }

// ✅ Good - Specific typing  
const handleRecipeData = (data: Recipe) => { ... }
```

### Naming Conventions
- **Files:** camelCase (`recipeCard.tsx`, `brewTimer.tsx`)
- **Components:** PascalCase (`RecipeCard`, `BrewTimer`)
- **Variables/Functions:** camelCase (`brewTime`, `handleStartBrew`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_BREW_TIME`)
- **Types/Interfaces:** PascalCase (`Recipe`, `BrewMethod`)

### Component Standards
- **Functional components only:** No class components
- **TypeScript interfaces:** Define props with explicit types
- **Theme integration:** Use `useThemeColor` for colors
- **Safe area handling:** Include safe area insets for navigation

```tsx
// ✅ Good component structure
interface BrewCardProps {
  recipe: Recipe;
  onPress: () => void;
  style?: ViewStyle;
}

export const BrewCard = ({ recipe, onPress, style }: BrewCardProps) => {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]}>
      <ThemedText style={{ color: textColor }}>{recipe.name}</ThemedText>
    </TouchableOpacity>
  );
};
```

### File Organization
```
components/
├── shared/           # Cross-silo components (BrewHeader, ThemedText)
├── ui/              # Base UI components (Button, Input, Modal)  
└── [feature]/       # Feature-specific components (RecipeCard)

hooks/
├── useThemeColor.ts # Theme integration
├── useTimer.ts      # Timer functionality
└── useBrew.ts       # Brewing logic

types/
├── recipe.ts        # Recipe-related types
├── equipment.ts     # Equipment types
└── brewing.ts       # Brewing session types
```

### Import Organization
```typescript
// 1. React and React Native imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 3. Local imports (use @/ alias)
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Recipe } from '@/types/recipe';
```

## Code Quality

### ESLint Configuration
The project uses ESLint with TypeScript rules:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Code Style Rules
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Double quotes for strings, single for JSX props
- **Semicolons:** Required
- **Trailing commas:** Required for multiline objects/arrays
- **Line length:** 80 characters preferred, 100 maximum

```typescript
// ✅ Good formatting
const brewSettings = {
  grindSize: 'medium-fine',
  waterTemp: 205,
  brewTime: 240,
  ratio: 16.5,
};

// ❌ Bad formatting  
const brewSettings={grindSize:"medium-fine",waterTemp:205,brewTime:240,ratio:16.5}
```

## Testing Strategy (Planned)

### Testing Pyramid
1. **Unit Tests (70%):** Individual functions and components
2. **Integration Tests (20%):** Component interactions  
3. **E2E Tests (10%):** Full user workflows

### Testing Tools
- **Jest:** Test runner and assertions
- **React Native Testing Library:** Component testing
- **Maestro:** E2E testing for mobile apps

### Test Structure
```
__tests__/
├── components/      # Component unit tests
├── hooks/          # Custom hook tests
├── utils/          # Utility function tests
└── integration/    # Integration tests

e2e/
├── recipes/        # Recipe workflow tests
├── brewing/        # Brewing session tests
└── settings/       # Settings tests
```

### Example Tests
```typescript
// Unit test example
import { render, screen } from '@testing-library/react-native';
import { BrewCard } from '@/components/BrewCard';

test('displays recipe name', () => {
  const mockRecipe = { name: 'Ethiopian V60', method: 'v60' };
  render(<BrewCard recipe={mockRecipe} onPress={() => {}} />);
  
  expect(screen.getByText('Ethiopian V60')).toBeTruthy();
});

// Hook test example
import { renderHook, act } from '@testing-library/react-hooks';
import { useTimer } from '@/hooks/useTimer';

test('timer increments correctly', () => {
  const { result } = renderHook(() => useTimer());
  
  act(() => {
    result.current.start();
  });
  
  // Assert timer behavior
});
```

## Git Workflow

### Branch Strategy
- **main:** Production-ready code
- **develop:** Integration branch for features
- **feature/[name]:** Individual feature development
- **hotfix/[issue]:** Critical bug fixes

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(recipes): add recipe creation form
fix(timer): resolve pause/resume bug
docs(readme): update installation instructions
style(components): fix linting issues
refactor(navigation): migrate to React Navigation v6
```

### Pull Request Process
1. **Create feature branch** from `develop`
2. **Implement feature** following code standards
3. **Run tests and linting** before pushing
4. **Create PR** with detailed description
5. **Code review** by team member
6. **Merge to develop** after approval

## Debugging

### React Native Debugger
```bash
# Enable debugging
expo start
# Press 'j' to open debugger
# Or shake device and select "Debug Remote JS"
```

### Common Debugging Tools
- **Console.log:** Basic debugging (remove before commit)
- **React DevTools:** Component inspection
- **Network Inspector:** API call monitoring
- **Performance Monitor:** Identify bottlenecks

### Platform-Specific Debugging

**iOS:**
- Xcode console for native logs
- iOS Simulator device logs
- Instruments for performance profiling

**Android:**
- Android Studio Logcat
- Chrome DevTools for debugging
- Android Studio profiler

## Performance Guidelines

### React Native Performance
- **Avoid inline functions** in render methods
- **Use React.memo** for expensive components
- **Optimize FlatList** with proper item layout
- **Minimize bridge calls** between JS and native

```typescript
// ✅ Good - Memoized component
const RecipeItem = React.memo(({ recipe, onPress }: RecipeItemProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{recipe.name}</Text>
    </TouchableOpacity>
  );
});

// ❌ Bad - Inline function creates new function every render
<FlatList
  data={recipes}
  renderItem={({ item }) => (
    <RecipeItem recipe={item} onPress={() => navigate(item.id)} />
  )}
/>

// ✅ Good - Stable reference
const handleRecipePress = useCallback((id: string) => {
  navigate(id);
}, [navigate]);
```

### Bundle Size Optimization
- **Tree shaking:** Import only needed modules
- **Code splitting:** Load features on demand
- **Image optimization:** Use appropriate formats and sizes
- **Remove dead code:** Regular cleanup of unused imports

## Accessibility

### Accessibility Guidelines
- **Screen reader support:** Add accessibility labels
- **Focus management:** Proper tab order
- **Color contrast:** Meet WCAG 2.1 AA standards
- **Touch targets:** Minimum 44x44pt touch areas

```typescript
// ✅ Good accessibility
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Start brewing timer"
  accessibilityHint="Double tap to begin the brewing countdown"
  accessibilityRole="button"
>
  <Text>Start Brew</Text>
</TouchableOpacity>
```

## Development Environment

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Hero** (auto-import organization)
- **Expo Tools** (Expo-specific features)
- **ESLint** (code quality)
- **Prettier** (code formatting)
- **GitLens** (Git integration)

### VS Code Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
expo start -c  # Clear cache
```

**TypeScript errors after dependency changes:**
```bash
# Restart TypeScript server in VS Code
# Command Palette -> TypeScript: Restart TS Server
```

**Platform-specific build issues:**
```bash
# iOS
cd ios && pod install && cd ..

# Android  
cd android && ./gradlew clean && cd ..
```

**Hot reload not working:**
- Check if firewall is blocking Metro
- Ensure device and computer on same network
- Try USB connection instead of WiFi

---

**Next:** Explore the design system in the [Design System Guide](./design-system.md).
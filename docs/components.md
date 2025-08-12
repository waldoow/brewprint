# 🧩 Components

Brewprint uses a component-based architecture with theme support and consistent design patterns. This guide covers the component library, usage examples, and integration patterns.

## Component Categories

### 🎨 Themed Components
Foundation components that automatically adapt to light/dark themes.

### 🧭 Navigation Components  
Specialized components for navigation and user flows.

### 📝 Form Components
Input controls and form elements with validation.

### 📊 Data Display Components
Components for displaying brewing data and metrics.

## Complete Component Library

Brewprint now includes a comprehensive set of themed components inspired by shadcn/ui design patterns with coffee-themed styling and complete light/dark mode support.

### 🎨 Themed Form Components
- **ThemedInput** - Text input with type support (text, email, password, number)
- **ThemedTextArea** - Multi-line text input with resizing
- **ThemedCheckBox** - Checkbox with label support
- **ThemedSelect** - Dropdown select with modal picker
- **ThemedSwitch** - Toggle switch with smooth animation
- **ThemedLabel** - Flexible label component with variants

### 🧭 Navigation & Layout Components
- **BrewHeader** - Customizable header with back navigation
- **ThemedTabs** - Tab navigation with content support
- **ThemedSeparator** - Horizontal/vertical dividers

### 🏷️ Display Components
- **ThemedText** - Theme-aware text with typography variants
- **ThemedView** - Theme-aware container component
- **ThemedButton** - Button with multiple variants and sizes
- **ThemedBadge** - Status badges and labels

## Core Components

### BrewHeader
**Purpose:** Flexible header component with customizable content area

**Props:**
```typescript
interface BrewHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  backButtonTitle?: string;
  customContent?: React.ReactNode; // Custom stats/progress section
  style?: ViewStyle;
}
```

**Usage Example:**
```tsx
import { BrewHeader } from "@/components/coffee/BrewHeader";

<BrewHeader
  title="Brewing Timer"
  subtitle="V60 Pour Over"
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
  customContent={
    <View>
      {/* Custom progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '60%' }]} />
      </View>
      
      {/* Custom stats */}
      <View style={styles.statsRow}>
        <Text>2:30</Text>
        <Text>18g</Text>
        <Text>250ml</Text>
      </View>
    </View>
  }
/>
```

**Key Features:**
- Only the circular arrow is touchable for back navigation
- Completely customizable content area
- Automatic theme integration
- Safe area handling

### ThemedText
**Purpose:** Text component with automatic theme switching

**Props:**
```typescript
interface ThemedTextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  style?: TextStyle;
  children: React.ReactNode;
}
```

**Usage Example:**
```tsx
import { ThemedText } from "@/components/ui/ThemedText";

<ThemedText type="title">Brewing Recipe</ThemedText>
<ThemedText type="subtitle">Ethiopian Yirgacheffe</ThemedText>
<ThemedText type="default">Grind size: Medium-fine</ThemedText>
```

**Text Types:**
- **default:** Regular body text
- **title:** Large heading (32px, weight 700)
- **subtitle:** Section headers (20px, weight 600)
- **defaultSemiBold:** Emphasized text (weight 600)
- **link:** Interactive text with link styling

### ThemedView
**Purpose:** View component with automatic theme switching

**Props:**
```typescript
interface ThemedViewProps {
  lightColor?: string;
  darkColor?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}
```

**Usage Example:**
```tsx
import { ThemedView } from "@/components/ui/ThemedView";

<ThemedView style={styles.container}>
  <ThemedText>Content with themed background</ThemedText>
</ThemedView>
```

### ThemedButton
**Purpose:** Button component with shadcn-inspired variants and complete theme integration

**Props:**
```typescript
interface ThemedButtonProps {
  title: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  onPress?: () => void;
}
```

**Usage Examples:**
```tsx
import { ThemedButton } from "@/components/ui/ThemedButton";

// Primary action
<ThemedButton title="Start Brew" />

// Different variants
<ThemedButton title="Cancel" variant="outline" />
<ThemedButton title="Delete" variant="destructive" />
<ThemedButton title="Skip" variant="ghost" />

// Different sizes
<ThemedButton title="Large Button" size="lg" />
<ThemedButton title="Small" size="sm" />

// Loading state
<ThemedButton title="Saving..." loading />
```

### ThemedInput
**Purpose:** Flexible input component with type support and theme integration

**Props:**
```typescript
interface ThemedInputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}
```

**Usage Examples:**
```tsx
import { ThemedInput } from "@/components/ui/ThemedInput";

// Text input with label
<ThemedInput 
  label="Recipe Name" 
  placeholder="Ethiopian V60" 
  type="text"
/>

// Email input
<ThemedInput 
  type="email" 
  placeholder="your@email.com"
  label="Email Address" 
/>

// Password with show/hide toggle
<ThemedInput 
  type="password" 
  placeholder="Password"
  label="Password" 
/>

// Number input
<ThemedInput 
  type="number" 
  placeholder="18"
  label="Coffee Weight (g)" 
/>

// With error state
<ThemedInput 
  label="Grind Size"
  error="Please enter a valid grind size"
  variant="outline"
/>
```

### ThemedTextArea
**Purpose:** Multi-line text input with customizable height

**Props:**
```typescript
interface ThemedTextAreaProps {
  label?: string;
  error?: string;
  minHeight?: number;
  maxHeight?: number;
  variant?: 'default' | 'outline' | 'filled';
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}
```

**Usage Examples:**
```tsx
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";

// Basic textarea
<ThemedTextArea 
  label="Brewing Notes"
  placeholder="Describe your brewing process..."
  minHeight={80}
  maxHeight={200}
/>

// With custom sizing
<ThemedTextArea 
  label="Tasting Notes"
  placeholder="Flavor profile, aroma, body..."
  minHeight={120}
  variant="filled"
/>
```

### ThemedCheckBox
**Purpose:** Checkbox with label and theme support

**Props:**
```typescript
interface ThemedCheckBoxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
}
```

**Usage Examples:**
```tsx
import { ThemedCheckBox } from "@/components/ui/ThemedCheckBox";

// Basic checkbox
<ThemedCheckBox
  label="Show only my recipes"
  checked={showMyRecipes}
  onCheckedChange={setShowMyRecipes}
/>

// Different sizes
<ThemedCheckBox
  label="Enable notifications"
  checked={notifications}
  onCheckedChange={setNotifications}
  size="lg"
/>

// Disabled state
<ThemedCheckBox
  label="Premium feature"
  checked={false}
  onCheckedChange={() => {}}
  disabled
/>
```

### ThemedSelect
**Purpose:** Dropdown select with modal picker

**Props:**
```typescript
interface ThemedSelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
}

interface SelectOption {
  label: string;
  value: string;
}
```

**Usage Examples:**
```tsx
import { ThemedSelect } from "@/components/ui/ThemedSelect";

const grindSizes = [
  { label: 'Extra Fine', value: 'extra-fine' },
  { label: 'Fine', value: 'fine' },
  { label: 'Medium-Fine', value: 'medium-fine' },
  { label: 'Medium', value: 'medium' },
  { label: 'Coarse', value: 'coarse' },
];

<ThemedSelect
  label="Grind Size"
  options={grindSizes}
  value={selectedGrind}
  onValueChange={setSelectedGrind}
  placeholder="Select grind size"
/>
```

### ThemedSwitch
**Purpose:** Toggle switch with smooth animation

**Props:**
```typescript
interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
}
```

**Usage Examples:**
```tsx
import { ThemedSwitch } from "@/components/ui/ThemedSwitch";

// Basic switch
<ThemedSwitch
  label="Enable timer alerts"
  value={timerAlerts}
  onValueChange={setTimerAlerts}
/>

// Different sizes
<ThemedSwitch
  label="Dark mode"
  value={darkMode}
  onValueChange={setDarkMode}
  size="lg"
/>
```

### ThemedTabs
**Purpose:** Tab navigation with content support

**Props:**
```typescript
interface ThemedTabsProps {
  items: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'default' | 'sm' | 'lg';
}

interface TabItem {
  label: string;
  value: string;
  content?: React.ReactNode;
}
```

**Usage Examples:**
```tsx
import { ThemedTabs } from "@/components/ui/ThemedTabs";

const recipeTabs = [
  { 
    label: 'V60', 
    value: 'v60',
    content: <V60RecipeContent />
  },
  { 
    label: 'French Press', 
    value: 'french-press',
    content: <FrenchPressContent />
  },
  { 
    label: 'Espresso', 
    value: 'espresso',
    content: <EspressoContent />
  },
];

<ThemedTabs
  items={recipeTabs}
  defaultValue="v60"
  variant="pills"
  onValueChange={setActiveTab}
/>
```

### ThemedLabel
**Purpose:** Flexible label component with variants

**Props:**
```typescript
interface ThemedLabelProps {
  variant?: 'default' | 'secondary' | 'muted' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  required?: boolean;
  children: React.ReactNode;
}
```

**Usage Examples:**
```tsx
import { ThemedLabel } from "@/components/ui/ThemedLabel";

// Standard label
<ThemedLabel>Coffee Weight</ThemedLabel>

// Required field
<ThemedLabel required>Email Address</ThemedLabel>

// Different variants
<ThemedLabel variant="muted">Optional field</ThemedLabel>
<ThemedLabel variant="destructive">Error occurred</ThemedLabel>
```

### ThemedBadge
**Purpose:** Status badges with multiple variants

**Props:**
```typescript
interface ThemedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}
```

**Usage Examples:**
```tsx
import { ThemedBadge } from "@/components/ui/ThemedBadge";

// Status badges
<ThemedBadge variant="success">Perfect</ThemedBadge>
<ThemedBadge variant="warning">Needs adjustment</ThemedBadge>
<ThemedBadge variant="destructive">Failed</ThemedBadge>

// Different sizes
<ThemedBadge size="sm">New</ThemedBadge>
<ThemedBadge size="lg">Featured</ThemedBadge>

// Custom content
<ThemedBadge variant="outline">
  {recipeCount} recipes
</ThemedBadge>
```

### ThemedSeparator
**Purpose:** Horizontal and vertical dividers

**Props:**
```typescript
interface ThemedSeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'default' | 'sm' | 'lg';
}
```

**Usage Examples:**
```tsx
import { ThemedSeparator } from "@/components/ui/ThemedSeparator";

// Horizontal divider
<ThemedSeparator />

// Custom thickness
<ThemedSeparator size="lg" />

// Vertical divider
<ThemedSeparator orientation="vertical" />
```

## Theme Integration

### Color System
Components use the `useThemeColor` hook for automatic theme switching:

```typescript
import { useThemeColor } from "@/hooks/useThemeColor";

const backgroundColor = useThemeColor({}, 'background');
const textColor = useThemeColor({}, 'text');
const iconColor = useThemeColor({}, 'icon');
```

### Available Theme Colors
```typescript
// From constants/Colors.ts
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE', 
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
```

## Component Patterns

### Custom Content Pattern
The BrewHeader demonstrates how components can accept custom content for maximum flexibility:

```tsx
// Instead of rigid props like:
// progress={0.65}
// stats={[{label: "Time", value: "2:30"}]}

// Use flexible custom content:
customContent={
  <YourCustomComponent />
}
```

This pattern allows:
- Complete layout control
- Custom styling per screen
- Dynamic content based on screen state
- Reusable component with maximum flexibility

### Theme-Aware Styling
Components should automatically adapt to theme changes:

```tsx
const Component = () => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        Themed content
      </Text>
    </View>
  );
};
```

### Safe Area Integration
Navigation components handle safe areas automatically:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom
    }}>
      {/* Header content */}
    </View>
  );
};
```

## Component Examples

### Recipe Form Example
```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import {
  ThemedInput,
  ThemedTextArea,
  ThemedSelect,
  ThemedCheckBox,
  ThemedSwitch,
  ThemedButton,
  ThemedLabel,
  ThemedBadge,
  ThemedSeparator,
} from '@/components';

const RecipeForm = () => {
  const [recipeName, setRecipeName] = useState('');
  const [grindSize, setGrindSize] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [enableTimer, setEnableTimer] = useState(true);

  const grindOptions = [
    { label: 'Extra Fine', value: 'extra-fine' },
    { label: 'Fine', value: 'fine' },
    { label: 'Medium', value: 'medium' },
    { label: 'Coarse', value: 'coarse' },
  ];

  return (
    <View style={{ padding: 20 }}>
      <ThemedLabel required>Recipe Details</ThemedLabel>
      
      <ThemedInput
        label="Recipe Name"
        placeholder="Ethiopian V60"
        value={recipeName}
        onChangeText={setRecipeName}
        type="text"
      />

      <ThemedSelect
        label="Grind Size"
        options={grindOptions}
        value={grindSize}
        onValueChange={setGrindSize}
        placeholder="Select grind size"
      />

      <ThemedInput
        label="Coffee Weight"
        placeholder="18"
        type="number"
        size="sm"
      />

      <ThemedTextArea
        label="Brewing Notes"
        placeholder="Describe your brewing process..."
        value={notes}
        onChangeText={setNotes}
        minHeight={100}
      />

      <ThemedSeparator />

      <ThemedSwitch
        label="Enable brewing timer"
        value={enableTimer}
        onValueChange={setEnableTimer}
      />

      <ThemedCheckBox
        label="Make recipe public"
        checked={isPublic}
        onCheckedChange={setIsPublic}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <ThemedButton title="Save Recipe" />
        <ThemedButton title="Cancel" variant="outline" />
      </View>

      <ThemedBadge variant="success" style={{ marginTop: 10 }}>
        Recipe saved successfully!
      </ThemedBadge>
    </View>
  );
};
```

### Recipe Card Component
```tsx
interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const RecipeCard = ({ recipe, onPress, variant = 'default' }: RecipeCardProps) => {
  return (
    <ThemedView style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText type="defaultSemiBold">{recipe.name}</ThemedText>
          <ThemedBadge variant={recipe.difficulty === 'easy' ? 'success' : 'warning'}>
            {recipe.difficulty}
          </ThemedBadge>
        </View>
        
        <ThemedText type="default">{recipe.method}</ThemedText>
        
        {variant === 'default' && (
          <>
            <ThemedSeparator size="sm" />
            <View style={styles.stats}>
              <ThemedLabel variant="muted">{recipe.grindSize}</ThemedLabel>
              <ThemedLabel variant="muted">{recipe.brewTime}</ThemedLabel>
              <ThemedLabel variant="muted">{recipe.rating}/5</ThemedLabel>
            </View>
          </>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};
```

### Brewing Interface Example
```tsx
const BrewingInterface = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const brewingTabs = [
    {
      label: 'Timer',
      value: 'timer',
      content: (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ThemedText type="title">4:30</ThemedText>
          <ThemedButton 
            title={isTimerRunning ? 'Pause' : 'Start'} 
            onPress={() => setIsTimerRunning(!isTimerRunning)}
            size="lg"
          />
          <ThemedButton 
            title="Reset" 
            variant="outline" 
            style={{ marginTop: 10 }}
          />
        </View>
      )
    },
    {
      label: 'Steps',
      value: 'steps',
      content: (
        <View>
          <ThemedLabel>Brewing Steps:</ThemedLabel>
          <ThemedCheckBox label="Heat water to 205°F" checked={true} onCheckedChange={() => {}} />
          <ThemedCheckBox label="Wet filter" checked={true} onCheckedChange={() => {}} />
          <ThemedCheckBox label="Add coffee and bloom" checked={false} onCheckedChange={() => {}} />
        </View>
      )
    }
  ];

  return (
    <View>
      <ThemedTabs
        items={brewingTabs}
        value={activeTab}
        onValueChange={setActiveTab}
        variant="underline"
      />
    </View>
  );
};
```

## Component Development Guidelines

### TypeScript Requirements
- All components must have TypeScript interfaces
- Props should be explicitly typed
- Use generic types for reusable components
- Export interfaces for external usage

### Styling Conventions
- Use StyleSheet.create for styles
- Follow camelCase naming for style properties
- Group related styles together
- Use theme colors through useThemeColor hook

### Accessibility
- Add accessible labels and hints
- Support screen readers
- Ensure proper focus management
- Test with accessibility features enabled

### Performance
- Use React.memo for expensive components
- Avoid creating objects in render methods
- Use useCallback for event handlers
- Optimize FlatList rendering with proper keyExtractor

## Testing Components

### Unit Testing (Planned)
```typescript
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';

test('renders text correctly', () => {
  render(<ThemedText>Hello World</ThemedText>);
  expect(screen.getByText('Hello World')).toBeTruthy();
});
```

### Component Testing (Planned)
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { BrewHeader } from '../BrewHeader';

test('calls onBackPress when back button is pressed', () => {
  const mockOnBackPress = jest.fn();
  render(<BrewHeader title="Test" onBackPress={mockOnBackPress} />);
  
  fireEvent.press(screen.getByRole('button'));
  expect(mockOnBackPress).toHaveBeenCalled();
});
```

---

**Next:** Learn about development workflows in the [Development Guide](./development.md).
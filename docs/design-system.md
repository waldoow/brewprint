# 🎨 Design System

Brewprint's design system creates a cohesive, coffee-inspired visual identity that enhances the brewing experience. This guide covers colors, typography, spacing, and UI patterns.

## Visual Identity

### Brand Personality
- **Minimalist:** Clean, distraction-free interface
- **Warm:** Coffee-inspired colors and friendly interactions
- **Precise:** Professional tools for brewing accuracy
- **Accessible:** Inclusive design for all users

### Design Philosophy
- **Coffee-First:** Visual elements inspired by coffee culture
- **Contextual Actions:** Right action, right place, right time
- **Guided Workflows:** Step-by-step processes for complex tasks
- **No FABs:** Header-based actions for better accessibility

## Color Palette

### Current Theme System
Located in `constants/Colors.ts`:

```typescript
export const Colors = {
  light: {
    text: '#11181C',           // Dark gray text
    background: '#fff',         // Pure white background
    tint: '#0a7ea4',           // Blue accent
    icon: '#687076',           // Medium gray icons
    tabIconDefault: '#687076',  // Inactive tab icons
    tabIconSelected: '#0a7ea4', // Active tab icons
  },
  dark: {
    text: '#ECEDEE',           // Light gray text
    background: '#151718',      // Dark background
    tint: '#fff',              // White accent
    icon: '#9BA1A6',           // Light gray icons
    tabIconDefault: '#9BA1A6', // Inactive tab icons
    tabIconSelected: '#fff',   // Active tab icons
  },
};
```

### Coffee-Inspired Palette (Planned)
```css
/* Primary Coffee Colors */
--espresso: #3C2415;      /* Dark brown, primary text */
--coffee-bean: #8B4513;   /* Medium brown, accents */
--caramel: #D2691E;       /* Warm brown, highlights */
--cream: #F5F5DC;         /* Light cream, backgrounds */

/* Supporting Colors */
--golden: #DAA520;        /* Gold, success states */
--steam: #F8F8FF;         /* Light gray, subtle backgrounds */
--copper: #B87333;        /* Warm metal, interactive elements */

/* Functional Colors */
--success: #228B22;       /* Green, successful brews */
--warning: #FF8C00;       /* Orange, attention needed */
--error: #DC143C;         /* Red, errors and alerts */
--info: #4169E1;          /* Blue, informational content */
```

### Usage Guidelines

**Text Colors:**
- Primary text: Espresso (#3C2415) in light mode
- Secondary text: 70% opacity of primary
- Disabled text: 40% opacity of primary

**Background Colors:**
- Primary: Cream (#F5F5DC) in light mode
- Cards/Surfaces: Pure white with subtle shadows
- Modals: Semi-transparent overlays

**Interactive Colors:**
- Buttons: Coffee Bean (#8B4513) primary
- Links: Copper (#B87333) for navigation
- Focus states: Golden (#DAA520) highlights

## Typography

### Current Typography
**Font:** SpaceMono (monospace)
- Simple, technical feel
- Good for development phase
- **Will be replaced** in production

### Planned Typography System

**Primary Font: Manrope**
- Modern, clean sans-serif
- Excellent readability
- Wide range of weights (200-800)
- Usage: UI elements, body text, labels

**Display Font: Playfair Display**
- Elegant serif with coffee culture resonance
- High contrast and distinctive
- Usage: Headings, recipe names, branding

**Monospace Font: JetBrains Mono**
- Technical precision for measurements
- Usage: Timer displays, measurements, data

### Typography Scale
```css
/* Headings */
h1: 32px / 700 weight   /* Page titles */
h2: 24px / 600 weight   /* Section headers */  
h3: 20px / 600 weight   /* Subsections */
h4: 18px / 500 weight   /* Card titles */

/* Body Text */
body: 16px / 400 weight     /* Primary text */
caption: 14px / 400 weight  /* Secondary text */
label: 12px / 500 weight    /* Form labels */
micro: 10px / 400 weight    /* Fine print */

/* Display */
hero: 48px / 700 weight     /* Hero sections */
timer: 36px / 300 weight    /* Timer displays */
data: 20px / 500 weight     /* Important metrics */
```

### Current Implementation
From `components/ThemedText.tsx`:

```typescript
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
```

## Spacing & Layout

### Spacing Scale
Based on 4px base unit for consistent rhythm:

```css
/* Base spacing units */
xs: 4px    /* Fine adjustments */
sm: 8px    /* Small gaps */
md: 16px   /* Standard spacing */
lg: 24px   /* Section spacing */
xl: 32px   /* Large sections */
xxl: 48px  /* Page-level spacing */
```

### Layout Patterns

**Container Spacing:**
- Horizontal padding: 20px (medium screens), 16px (small screens)
- Vertical rhythm: 16px between related elements
- Section spacing: 24px between major sections

**Component Spacing:**
- Button padding: 12px vertical, 20px horizontal
- Card padding: 16px all sides
- Header spacing: 8px between title and subtitle

### Current Implementation
From existing components:

```typescript
// BrewHeader spacing
container: {
  paddingHorizontal: 20,
  paddingTop: 40,
  paddingBottom: 20,
  gap: 16,
},

// Home screen spacing  
sectionContainer: {
  gap: 8,
  marginBottom: 16,
  paddingHorizontal: 20,
},
```

## Component Patterns

### Button Styles

**Primary Button (Planned):**
```css
background: var(--coffee-bean);
color: white;
padding: 12px 20px;
border-radius: 8px;
font-weight: 600;
```

**Secondary Button (Planned):**
```css
background: transparent;
color: var(--coffee-bean);
border: 1px solid var(--coffee-bean);
padding: 12px 20px;
border-radius: 8px;
```

**Text Button (Planned):**
```css
background: transparent;
color: var(--copper);
padding: 8px 12px;
font-weight: 500;
```

### Card Patterns

**Recipe Card (Planned):**
- White background with subtle shadow
- 8px border radius
- 16px internal padding
- Coffee Bean accent for active states

**Stats Card (Current):**
```typescript
// From index.tsx implementation
statsSection: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 8,
},
statItem: {
  alignItems: "center",
  flex: 1,
},
```

### Input Patterns

**Form Fields (Planned):**
- Cream background with subtle border
- Coffee Bean border on focus
- 12px border radius
- Clear validation states

**Timer Input (Planned):**
- Large, prominent display
- Monospace font for precision
- Golden accent for active timing

## Icons & Graphics

### Current Icon System
**Expo Symbols** (iOS-style system icons)
- Platform-consistent appearance
- Automatic dark/light mode switching
- Limited customization options

### Planned Icon System
**Lucide React Native**
- Consistent design across platforms
- Extensive coffee and kitchen icons
- Customizable stroke width and colors
- Better coffee-specific iconography

### Icon Usage Guidelines
- **Size scale:** 16px (small), 20px (medium), 24px (large), 32px (hero)
- **Colors:** Use theme icon colors with Coffee Bean for active states
- **Style:** Consistent stroke width, prefer outlined over filled
- **Context:** Choose icons that reinforce coffee brewing context

## Accessibility

### Color Accessibility
- **Contrast ratios:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Color blindness:** Never rely on color alone for information
- **High contrast mode:** Ensure compatibility with system settings

### Typography Accessibility  
- **Minimum sizes:** 16px for body text, 14px for captions
- **Line height:** 1.4-1.6 for optimal readability
- **Font weights:** Avoid extremely light weights (<300)

### Interactive Elements
- **Touch targets:** Minimum 44x44pt (iOS) / 48x48dp (Android)
- **Focus indicators:** Clear visual focus states
- **Screen reader:** Proper labels and semantic markup

## Dark Mode

### Dark Theme Approach
- **Automatic switching:** Respect system preference
- **True blacks avoided:** Use dark grays for better OLED performance
- **Reduced contrast:** Softer colors to reduce eye strain
- **Consistent branding:** Maintain coffee identity in dark mode

### Dark Mode Colors (Planned)
```css
/* Dark theme coffee colors */
--dark-background: #1A1611;    /* Very dark brown */
--dark-surface: #2A201A;       /* Dark coffee surface */
--dark-text: #F5F5DC;          /* Cream text */
--dark-accent: #D2691E;        /* Warm caramel accent */
```

## Implementation Status

### ✅ Current Implementation
- Basic light/dark theme system
- ThemedText and ThemedView components
- Consistent spacing in BrewHeader
- Safe area handling

### 📋 Planned Implementation
- Coffee-inspired color palette
- Manrope + Playfair Display typography
- Comprehensive component library
- Lucide React Native icons
- Enhanced dark mode support

### 🎯 Design System Goals
1. **Cohesive Identity:** Strong coffee-inspired visual brand
2. **Accessibility First:** WCAG 2.1 AA compliance minimum
3. **Platform Consistency:** Native feel on iOS and Android
4. **Developer Experience:** Easy-to-use themed components
5. **Maintainability:** Centralized design token system

---

**Previous:** Learn about development workflows in the [Development Guide](./development.md).
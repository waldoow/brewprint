# ☕️ Coffee Recipe Tracker

> A minimalist React Native app for coffee enthusiasts to perfect their brewing craft

## 🎯 Vision

Transform the way coffee lovers approach their daily brew by providing a comprehensive platform to document, refine, and share coffee recipes. Whether you're dialing in a new espresso shot or perfecting your V60 technique, this app helps you track every variable that matters.

## ✨ Core Features

### Recipe Management

- **Create & Edit**: Build detailed recipes with step-by-step instructions
- **Test & Iterate**: Record brewing attempts and refine parameters
- **Share**: Export recipes or share with the community
- **Template System**: Start from popular brewing methods
- **Recipe Folders**: Organize recipes in custom folders and collections
- **Recipe Variations**: Save multiple versions of the same base recipe
- **Batch Scaling**: Automatically scale recipes for different serving sizes
- **Smart Import/Export**: Share recipes via QR codes, JSON, or direct links

### Equipment Tracking

- **Grinder Profiles**: Save settings for different coffee types
- **Brewing Methods**: V60, Chemex, French Press, Espresso, and more
- **Calibration Tools**: Inter-grinder calibration for consistency
- **Equipment Notes**: Track maintenance and performance

### Bean Library

- **Origin Tracking**: Farm, region, processing method
- **Tasting Notes**: Flavor profiles and personal ratings
- **Inventory Management**: Track usage and freshness
- **Purchase History**: Where and when you bought beans

### Brewing Assistant

- **Guided Timer**: Step-by-step brewing with notifications
- **Parameter Tracking**: Water temperature, grind size, ratios
- **Extraction Analysis**: Track timing and yield
- **Environmental Factors**: Humidity, altitude considerations
- **Adaptive Brewing**: Timer adjustments based on your pace
- **Smart Recommendations**: AI-powered parameter suggestions
- **Visual Grind Guide**: Grind size comparisons and calculator

### Journal & Analytics

- **Brew History**: Complete log of all brewing sessions
- **Performance Metrics**: Success rates and improvement trends
- **Favorite Tracking**: Bookmark winning combinations
- **Export Data**: Backup your brewing journey
- **Personal Analytics**: Cost tracking, brewing streaks, taste evolution
- **Success Rate Analysis**: Which recipes work best for you
- **Seasonal Trends**: How your brewing changes over time
- **Equipment Performance**: Optimize grinder settings and usage

## 🛠 Technical Stack

| Category       | Technology                 | Purpose                            |
| -------------- | -------------------------- | ---------------------------------- |
| **Framework**  | React Native (Expo)        | Cross-platform mobile development  |
| **Language**   | TypeScript                 | Type safety and better DX          |
| **Navigation** | React Navigation v6        | Screen navigation and routing      |
| **Backend**    | Supabase                   | Database, auth, and real-time sync |
| **State**      | React Context + useReducer | Local state management             |
| **Icons**      | Lucide React Native        | Consistent iconography             |
| **Styling**    | StyleSheet + Theme system  | Custom design system               |

## 🏗 Architecture

The app follows a **silo-based architecture** where each major feature area is self-contained:

```
├── recipes/     ← Recipe CRUD and brewing logic
├── equipment/   ← Grinder and brewing method management
├── beans/       ← Coffee bean inventory and tracking
├── journal/     ← Brewing history and analytics
└── settings/    ← App preferences and user profile
```

Each silo contains its own:

- Stack navigator and screens
- Business logic and data handling
- Feature-specific components
- Type definitions

## 🎨 Design Philosophy

### Visual Identity

- **Minimalist Interface**: Clean, distraction-free brewing experience
- **Coffee-Inspired Palette**: Warm caramels, rich browns, cream tones
- **Typography**: Manrope for UI, Playfair Display for headings
- **No FABs**: Header-based actions for better accessibility

### User Experience

- **Guided Workflows**: Step-by-step recipe creation and brewing
- **Contextual Actions**: Right action, right place, right time
- **Offline-First**: Core functionality works without internet
- **Fast Input**: Quick entry methods for common actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone and install
git clone [repository-url]
cd coffee-app
npm install

# Start development server
expo start
```

### Development Workflow

1. **Structure**: Follow the silo-based organization
2. **Types**: Define interfaces in `/types` before building
3. **Components**: Build reusable UI in `/components`
4. **Testing**: Test on both platforms regularly

## 📋 Project Status

### Current Phase: Foundation

- [ ] Project structure and documentation
- [ ] Navigation architecture planning
- [ ] Core type definitions
- [ ] Theme system implementation
- [ ] Basic UI component library
- [ ] Recipe data models

### Next Phase: Core Features

- [ ] Recipe creation and editing
- [ ] Equipment management
- [ ] Bean inventory system
- [ ] Basic brewing timer
- [ ] Local data persistence

### Future Enhancements

- [ ] Supabase integration and sync
- [ ] Community features and recipe sharing
- [ ] Advanced analytics and insights
- [ ] Smart device integrations (scales, grinders)
- [ ] AI-powered recommendations and optimization
- [ ] Apple Watch / WearOS companion apps
- [ ] Camera features (bean scanning, grind analysis)
- [ ] Voice commands and accessibility features
- [ ] Grinder calibration system
- [ ] Web companion app (Next.js)
- [ ] Apple Health / Google Fit integration
- [ ] AR brewing guidance
- [ ] Professional barista tools
- [ ] Bean marketplace and trading
- [ ] IoT coffee lab integration

## 🤝 Contributing

This project follows strict architectural guidelines detailed in `/docs/rules.md`. Key principles:

- **TypeScript Only**: No JavaScript files
- **Functional Components**: No class components
- **Separation of Concerns**: UI and business logic separated
- **Consistent Naming**: camelCase for files, PascalCase for components

## 📄 License

MIT License - see LICENSE file for details

---

_Built with ☕️ for the coffee community_

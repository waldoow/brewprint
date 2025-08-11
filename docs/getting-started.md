# 🚀 Getting Started

Welcome to Brewprint! This guide will help you set up the development environment and get the app running on your preferred platform.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (latest version)
- **Git** for version control

### Platform-Specific Requirements

**For iOS Development:**
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing)

**For Android Development:**
- Android Studio with Android SDK
- Android emulator or physical Android device
- USB debugging enabled on physical device

**For Web Development:**
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brewprint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run lint
   ```

## Development Commands

### Core Commands
```bash
# Start development server
expo start

# Platform-specific startup
expo start --android    # Android emulator
expo start --ios        # iOS simulator  
expo start --web        # Web browser

# Code quality
npm run lint            # Run ESLint
```

### Project Management
```bash
# ⚠️ DO NOT USE - Will delete coffee app code
npm run reset-project  # Resets to blank Expo template
```

## First Run

1. **Start the development server**
   ```bash
   expo start
   ```

2. **Choose your platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

3. **Verify the app loads**
   - You should see the Brewprint home screen
   - Bottom tabs should be functional
   - Header should display "Brewprint" with stats

## Development Environment Setup

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Hero**
- **Expo Tools**
- **ESLint**
- **Prettier**

### Editor Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Troubleshooting

### Common Issues

**Metro bundler won't start:**
```bash
# Clear Metro cache
expo start -c
```

**TypeScript errors:**
```bash
# Restart TypeScript server in VS Code
# Command Palette -> TypeScript: Restart TS Server
```

**iOS Simulator issues:**
```bash
# Reset iOS Simulator
Device -> Erase All Content and Settings
```

**Android emulator issues:**
```bash
# Cold boot the emulator
# In Android Studio: AVD Manager -> Cold Boot Now
```

### Environment Issues

**Node version conflicts:**
- Use Node.js v18 or higher
- Consider using `nvm` for Node version management

**Expo CLI issues:**
```bash
# Update Expo CLI
npm install -g @expo/cli@latest
```

## Next Steps

Once you have the app running:

1. **Explore the architecture** → [Architecture Guide](./architecture.md)
2. **Learn about components** → [Components Guide](./components.md)  
3. **Understand development workflow** → [Development Guide](./development.md)
4. **Review design system** → [Design System](./design-system.md)

## Quick Reference

| Command | Description |
|---------|-------------|
| `expo start` | Start development server |
| `expo start --ios` | Run on iOS simulator |
| `expo start --android` | Run on Android emulator |
| `expo start --web` | Run in web browser |
| `npm run lint` | Check code quality |

---

**Need help?** Check the [Development Guide](./development.md) for detailed workflows and troubleshooting.
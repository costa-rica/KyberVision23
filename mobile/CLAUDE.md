# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run start` - Start Expo development server (includes TypeScript check)
- `npm run prestart` - Run TypeScript check without emitting files
- `npm run typecheck` - Check TypeScript types without emitting files
- `npm run typecheck:watch` - Watch mode for TypeScript checking
- `npm run lint` - Run ESLint using Expo configuration
- `npm run android` - Start development server for Android
- `npm run ios` - Start development server for iOS
- `npm run web` - Start development server for web

## Project Architecture

### Core Structure

This is a React Native Expo TypeScript app. The main entry point is `src/app/index.tsx`, but the root navigation container with Stack.Navigator is in `src/app/App.tsx`.

### Key Directories

- `src/app/` - Screen components organized by feature (welcome/, user-admin/)
- `src/components/` - Reusable UI components (buttons/, screen-frames/)
- `src/types/` - TypeScript type definitions
- `src/reducers/` - State management (team.ts, user.ts)
- `src/assets/` - Images and other static assets
- `docs/` - Documentation and reference files from previous version

### Navigation

- Uses React Navigation v7 with native stack navigator
- Typed navigation with `RootStackParamList` in `src/types/navigation.ts`
- Screen props are typed using `NativeStackScreenProps<RootStackParamList, ScreenName>`

### Component Conventions

- **ScreenFrame**: Components in `src/components/screen-frames/` standardize screen layout and handle modal presentation. Four variants exist:
  - `ScreenFrame` - Basic frame with back button
  - `ScreenFrameWithTopChildren` - Includes top section for custom content
  - `ScreenFrameWithTopChildrenSmall` - Smaller top section variant
  - `ScreenFrameWithTopChildrenSmallLandscape` - Landscape orientation variant
  - **Modal presentation**: Modals should be presented through ScreenFrame components rather than directly. Use `modalComponentAndSetterObject` property (most frames) or `isVisibleModal`/`setDisplayModal`/`modalComponent` properties(`ScreenFrameWithTopChildren`). The frame handles Modal wrapper and overlay management.
- **ButtonKvImage**: Custom button component for image-based buttons
- **ModalInformationOk**: Use instead of Alert.alert for simple "OK" confirmations. Supports info, success, error, and warning variants.
- **ModalInformationYesOrNo**: Use instead of Alert.alert for Yes/No confirmation dialogs.
- Components use TypeScript with proper prop typing

### Asset Management

- SVG support configured via `react-native-svg-transformer` in metro.config.js
- SVG modules declared in `src/types/svg.d.ts`
- Images organized by usage: multi-use/, screen-frame/, scripting/, user-admin/, welcome/

### TypeScript Configuration

- Strict TypeScript checking runs before development server starts
- Watch mode available for continuous type checking during development

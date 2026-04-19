# HouseofEdTech Mini LMS

React Native Expo developer assignment built as a production-style mini LMS with a classic, calmer UI direction instead of a generic startup-style interface.

## Stack

- Expo SDK 54
- React Native + Expo Router
- TypeScript strict mode
- NativeWind
- Zustand
- Expo SecureStore
- AsyncStorage
- Expo Notifications
- React Native WebView
- NetInfo
- Legend List

## What is implemented

- Login and registration flow with mock-first auth service
- Secure token storage with Expo SecureStore
- Auto session restore with basic refresh-token handling
- Course catalog powered by a clean API service layer
- Search, pull-to-refresh, bookmarks, and enrollment state
- Profile screen with learner stats and avatar switching
- Embedded WebView lesson screen with native-to-web bridge context
- Offline banner and retry-friendly API client with timeout handling
- Bookmark milestone notification after 5 saved courses
- 24-hour return reminder scheduling
- Clean separation between config, services, stores, domain types, and UI

## Architecture notes

- `app/`
  Expo Router screens and route groups.
- `src/services/api/`
  API client, auth service, course service, mock data, and error types.
- `src/stores/`
  Zustand stores for auth, courses, and preferences.
- `src/components/`
  Reusable UI primitives and feature components.
- `src/config/`
  App-level runtime configuration.
- `src/lib/`
  Storage abstractions for SecureStore and AsyncStorage.

## Mock mode and later API integration

The app currently runs in mock mode by default so the assignment is stable during review.

To switch to real API wiring later:

1. Open `app.json`
2. Change `expo.extra.useMockApi` from `true` to `false`
3. Keep `expo.extra.apiBaseUrl` pointed at `https://api.freeapi.app`
4. Expand the request mapping inside `src/services/api/auth-service.ts` and `src/services/api/course-service.ts`

## Setup

```bash
npm install
npm run start
```

## Useful commands

```bash
npm run lint
npm run typecheck
npm run android
npm run ios
```

## Build notes

For a local Android development build:

```bash
npx expo run:android
```

For CI or distributable Android builds, use EAS with an Android profile after adding your signing setup:

```bash
npx eas build -p android
```

## Runtime configuration

No external `.env` file is required for the current mock-first assignment build.

Runtime values live in `app.json` under:

- `expo.extra.apiBaseUrl`
- `expo.extra.useMockApi`

## Key engineering decisions

- Mock-first API mode keeps the project reviewable and reliable while preserving a backend-ready service layer.
- Tokens are isolated in SecureStore, while app data such as bookmarks and preferences live in AsyncStorage.
- Zustand keeps async state readable without over-engineering the app.
- Legend List is used for better list performance and smoother scrolling behavior.
- The WebView screen uses a local HTML template plus a native bridge payload for controlled embedded content.
- The UI uses a paper, navy, and brass palette to feel more timeless and course-oriented.

## Known limitations

- Profile image updates use curated remote avatar URLs instead of device camera/gallery selection.
- Auth service is mock-first and needs endpoint mapping to fully use `/api/v1/users`.
- The 24-hour reminder is scheduled locally on app open rather than using background task orchestration.
- No automated test suite has been added yet.

## Suggested demo checklist

- Sign in and relaunch to confirm session restore
- Search and refresh the course catalog
- Save 5 courses to trigger the bookmark notification
- Enroll in a course and open the embedded viewer
- Turn on airplane mode to verify the offline banner and persisted state

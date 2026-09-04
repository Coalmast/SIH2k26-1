# COMET Field App — Developer Setup Guide

> **For new team members joining the project.** Follow this guide exactly in order.
> The app uses native modules (Notifee, biometrics, camera) so it **cannot** run in Expo Go. You must build natively.

---

## Prerequisites

Install the following before anything else.

### 1. Node.js
- Download **Node.js 20 LTS** from https://nodejs.org
- Verify: `node -v` → should show `v20.x.x`

### 2. Java 17 (Required — not Java 21, not Java 26)

> [!CAUTION]
> The Gradle version used by this project (9.3.1) is **only compatible with Java 17**.
> Installing a newer JDK will cause Gradle to fail silently during builds.

Install via winget (Windows):
```powershell
winget install Microsoft.OpenJDK.17
```

After installing, **set JAVA_HOME for the current session** every time you open a new terminal:
```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.12.7-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

Verify: `java -version` → should show `openjdk version "17.x.x"`

> [!TIP]
> To make this permanent, add `JAVA_HOME` to your System Environment Variables via Control Panel → System → Advanced → Environment Variables.

### 3. Android Studio & SDK

1. Download and install **Android Studio** from https://developer.android.com/studio
2. Open Android Studio → **SDK Manager** → install:
   - **Android SDK Platform 36** (compileSdk target)
   - **Android SDK Build-Tools 36.0.0**
   - **NDK (Side by side) 27.1.12297006**
   - **CMake 3.22.1**
3. Set `ANDROID_HOME` environment variable:
   ```powershell
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   ```
4. Create an **Android Virtual Device (AVD)** via AVD Manager → choose a Pixel 7 with API 35+.

### 4. Expo CLI
```bash
npm install -g expo-cli
```

---

## Project Setup

### 1. Clone and install dependencies
```bash
git clone <repo-url>
cd SIH2026/app
npm install
```

### 2. Configure environment variables

Create `.env.local` in the `app/` directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_API_URL=http://localhost:8000
```

> [!IMPORTANT]
> Never commit `.env.local` to git. It is already in `.gitignore`.

### 3. Set local SDK path for Android builds

Create `android/local.properties` (this file is git-ignored):
```properties
sdk.dir=C:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk
```

> [!WARNING]
> Use **double backslashes** (`\\`) on Windows. Single backslashes are treated as Java escape characters and will silently break the build.

---

## Running the App

### First-time native build
```bash
npx expo prebuild --clean
npx expo run:android --no-build-cache
```
This will:
- Generate the `/android` native directory
- Download Gradle dependencies (~2–5 mins on first run)
- Install the APK on your connected emulator/device
- Start the Metro bundler

### Subsequent runs (JS changes only)
```bash
npx expo start -c
```
Then press `a` to open on Android. The `-c` flag clears Metro's JS bundle cache.

### If you change `app.json` or add a native package
You must rebuild:
```bash
npx expo prebuild --clean
npx expo run:android --no-build-cache
```

---

## Troubleshooting

### `Could not find any matches for app.notifee:core`
The Notifee Maven repository is configured via `expo-build-properties` in `app.json`. Ensure you ran `npx expo prebuild --clean` **after** `npm install`.

### Gradle build fails with `Unsupported class file major version`
Your active Java version is wrong. Run:
```powershell
java -version
```
If it shows Java 21 or 26, fix JAVA_HOME as shown in the Prerequisites section.

### `sdk.dir` path not found
Edit `android/local.properties` and confirm the path exists. Use double backslashes.

### CSS / NativeWind styles not applying
Clear the Metro cache:
```bash
npx expo start -c
```
Never add `"nativewind/babel"` to `babel.config.js` — this project uses NativeWind **v4** which only requires `jsxImportSource: "nativewind"` in `babel-preset-expo`.

### `TypeError: undefined is not a function` in `_layout.tsx`
The notification setup function is `bootstrapNotifications`, not `setupNotifications`. Verify the import in `app/_layout.tsx`.

### CMake error: `Target "rnworklets" links to "hermes-engine::libhermes" but not found`
You have `react-native-worklets` or `react-native-worklets-core` as a direct dependency in `package.json`. Remove them both — `react-native-reanimated` 4.x bundles its own worklets engine internally.

---

## Project Architecture

```
app/
├── app/                     # Expo Router file-based routes
│   ├── (auth)/              # Unauthenticated screens (login, biometric)
│   ├── (app)/               # Authenticated screens (tabs, inspection, report)
│   └── _layout.tsx          # Root layout — bootstraps notifications, auth
├── src/
│   ├── components/          # Reusable UI components (Binance design system)
│   ├── context/             # React Context providers (AuthContext)
│   ├── lib/                 # Core utilities
│   │   ├── notifications.ts # Notifee + expo-notifications setup
│   │   ├── supabase.ts      # Supabase client
│   │   └── watermelon.ts    # WatermelonDB local database
│   └── hooks/               # Custom React hooks
├── android/                 # Generated native Android project (git-ignored)
├── app.json                 # Expo config — SDK, permissions, plugins
├── babel.config.js          # Babel — NativeWind v4 jsxImportSource
├── metro.config.js          # Metro — withNativeWind CSS bundling
└── tailwind.config.js       # Tailwind — Binance design system tokens
```

---

## Design System

This app uses the **Binance Dark Design System**. All colors are pre-configured in `tailwind.config.js` under the `binance` key:

| Tailwind Class | Hex Value | Usage |
|---|---|---|
| `text-binance-primary` | `#fcd535` | Primary actions, highlights |
| `bg-binance-canvas-dark` | `#0b0e11` | App background |
| `bg-binance-surface-card-dark` | `#1e2329` | Cards, panels |
| `text-binance-on-dark` | `#ffffff` | Primary text on dark bg |
| `text-binance-muted-strong` | `#929aa5` | Secondary/muted text |
| `text-binance-trading-up` | `#0ecb81` | Success, online states |
| `text-binance-trading-down` | `#f6465d` | Error, danger states |

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `expo ~56.0.21` | Core SDK — do not upgrade without team sign-off |
| `react-native 0.85.3` | RN runtime |
| `@notifee/react-native` | Critical alarm notifications (bypasses DND) |
| `expo-notifications` | Standard push notification handling |
| `expo-local-authentication` | Biometric login (fingerprint/face) |
| `@nozbe/watermelondb` | Offline-first local SQLite database |
| `@supabase/supabase-js` | Backend API + realtime + auth |
| `nativewind v4` | Tailwind CSS for React Native |
| `react-native-reanimated 4.x` | Animations (includes worklets internally) |
| `expo-dev-client` | Enables custom native builds with dev menu |

> [!NOTE]
> **Do not add** `react-native-worklets` or `react-native-worklets-core` as direct dependencies. `react-native-reanimated` 4.x bundles its own worklets engine. Adding them separately causes a Hermes CMake linking error during the native build.

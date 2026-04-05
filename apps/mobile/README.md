# README.md

## UangKu – Automated Financial Tracker for Indonesians (Android Only)

### Overview

**UangKu** is an Android-exclusive mobile financial management application designed specifically for Indonesians who hold accounts across multiple banks and e-wallets. By automatically "listening" to transaction notifications from popular financial apps, UangKu consolidates scattered funds into a single, unified view—eliminating the need for manual transaction logging.

**Platform**: Android only (iOS not supported due to native notification interception requirements)

### 🎯 Problem Statement

Indonesian users typically have money distributed across multiple platforms: BCA, Mandiri, BRI, GoPay, OVO, Dana, Jago, Shopee, SeaBank, and many more.

Manually tracking balances and transactions across these platforms is tedious, error-prone, and time-consuming. UangKu solves this by intercepting transaction notifications in real-time and surfacing action buttons (Konfirmasi / Lewati) directly in the notification — no need to open the app.

### ✨ Key Features

1. **Notification-Based Tracking**: Automatically parses notifications from 10 supported financial apps using exact package name matching
2. **One-Tap Confirmation**: Sends push notifications with **Konfirmasi** and **Lewati** action buttons — user confirms or skips without opening the app
3. **Multi-Wallet Management**: Create and manage wallets for all your financial accounts
4. **Real-Time Balance Aggregation**: View total balance across all wallets in one place
5. **Transaction History**: Detailed transaction logs with categories (Income, Expense, Transfer)
6. **Monthly Reports**: Visual analytics comparing income vs. expenses
7. **Secure Authentication**: Google Sign-In with Expo Secure Store integration
8. **Permission Management**: User controls over which notifications the app listens to

### 🏗️ Architecture Overview

#### Tech Stack

- **Framework**: Expo React Native (SDK 54)
- **UI Library**: React Native Paper (Material Design 3)
- **State Management**: Zustand with persistence
- **HTTP Client**: Axios with centralized configuration
- **Authentication**: Google Sign-In + JWT tokens cached in SecureStore
- **Local Storage**: SecureStore
- **Icons**: MaterialCommunityIcons via @expo/vector-icons
- **Charts**: react-native-gifted-charts
- **Notifications**: react-native-android-notification-listener + expo-notifications

#### Project Structure

```
uangku-mobile/
├── app/                          # Expo Router file-based routing
│   ├── auth.tsx                 # Authentication screen (Google Sign-In)
│   ├── modal.tsx                # Modal routes
│   └── (tabs)/                  # Tab-based navigation (main app)
│       ├── index.tsx            # Transactions list
│       ├── wallets/             # Wallet management
│       ├── settings.tsx          # User profile & settings
│       └── report.tsx           # Monthly analytics & reports
├── app/onboarding/
│   ├── intro.tsx                # Feature highlights + Privacy Policy agreement
│   ├── permissions.tsx          # Notification listener permission request
│   └── wallets.tsx              # Wallet selection & initial balance setup
├── components/
│   ├── forms/
│   │   ├── transaction-form/    # Reusable transaction CRUD form
│   │   └── wallet-form/         # Reusable wallet CRUD form
│   ├── ui/                      # Reusable UI components
│   ├── inputs/                  # Form inputs (date-picker, dropdown, etc.)
│   └── illustrations/           # SVG illustrations
├── services/
│   └── notification/
│       ├── notification-service.ts  # Entry point: headless task + background task registration
│       ├── handler.ts               # Notification response handler (Konfirmasi / Lewati)
│       ├── parser.ts                # TransactionParser: amount extraction, type detection, OTP filter
│       ├── setup.ts                 # Notification channel + category setup
│       ├── sync.ts                  # syncPendingTransactions utility
│       └── types.ts                 # RawAndroidNotification and related types
├── store/                        # Zustand stores
│   ├── use-auth-store.ts        # Authentication state
│   ├── use-wallets-store.ts     # Wallets state
│   └── use-transactions-store.ts # Transactions state
├── hooks/
│   └── axios/                   # Custom hooks for API queries & mutations
├── lib/
│   └── axios.ts                 # Centralized Axios instance with interceptors
├── constants/
│   └── supported-apps.ts        # SUPPORTED_APPS_CONFIG, ALLOWED_APP_NAMES, categorized lists
├── types/                        # TypeScript interfaces
└── utils/                        # Utility functions
```

#### Core Services

**notification-service.ts** (Headless Listener — Action Button Architecture)

- Headless task that runs even when the app is closed
- **Exact package name allowlist** via `ALLOWED_APP_NAMES` (from `constants/supported-apps.ts`):
  ```
  com.bca | id.bmri.livin | id.co.bri.brimo | id.bni.wondr |
  com.jago.digitalbanking | id.co.bankbkemobile.digitalbank |
  com.shopeepay.id | com.gojek.gopay | ovo.id | id.dana
  ```
- Filters non-transaction notifications (OTP, login alerts, etc.) via `TransactionParser.isNonTransaction()`
- Extracts amount via `TransactionParser.extractAmount()` and detects transaction type via `TransactionParser.detectType()`
- **Schedules a local push notification with two action buttons:**
  - **Konfirmasi** — calls `POST /notifications/sync` with Bearer token directly from SecureStore
  - **Lewati** — dismisses the notification, no API call
- **Does NOT use a pending queue or SecureStore for transaction data** — all parsed data is embedded in `notification.data`
- No foreground sync, no confirmation screen, no pending records to clean up

**handler.ts** (Notification Response Handler)

- Handles button tap events from both foreground and background contexts
- On **Konfirmasi**: reads auth token from SecureStore, calls `POST /notifications/sync`
- On **Lewati**: dismisses notification silently
- Registered as `BACKGROUND-TRANSACTION-ACTION` via `expo-task-manager`

**API Integration (axios.ts)**

- Centralized Axios instance with base URL from environment
- Request interceptor: Adds JWT Bearer token to all requests
- Response interceptor: Handles 401 errors by redirecting to auth

### 🔄 User Flows

#### New User Onboarding

1. **Sign-In Screen**: Google Sign-In / Sign-Up
2. **Introduction Screen**: Highlights UangKu's three core features; user must agree to Privacy Policy before proceeding
3. **Permission Request**: Request Notification Listener permission; user can skip (manual input only)
4. **Wallet Checklist**: List of supported apps (plus Cash); user selects wallets and enters initial balances
5. **Main App**: Redirects to Transaction List

#### Existing User Login

1. **Sign-In Screen**: Google Sign-In only
2. **Main App**: Directly to Transaction List (preserving previous session)

#### Notification Confirmation Flow (Action Button Architecture)

1. Transaction notification arrives from a supported app
2. Headless task checks app name against `ALLOWED_APP_NAMES`
3. Parses title + text for amount; filters OTP/login alerts
4. Schedules a local push notification with all parsed data embedded in `notification.data`:
   - Title: `+Rp 10.000` or `-Rp 50.000`
   - Body: original notification text
   - Action buttons: **Konfirmasi** / **Lewati**
5. **User taps Konfirmasi** (app stays closed or open):
   - Handler reads token from SecureStore
   - Calls `POST /notifications/sync` with Bearer auth
   - Transaction saved; notification auto-dismissed
6. **User taps Lewati**:
   - Notification dismissed; no transaction created
7. When user opens the app, confirmed transactions are already visible in the list

### 📱 Screen Guide

#### 1. Transactions (Main Tab / index.tsx)

- **Header**: Total balance (aggregated from all wallets), Income, Expense summary
- **Date Navigation**: Left/right arrows + calendar picker for quick date jumping
- **Transaction List**: Grouped by date, color-coded by type
  - Green (`colors.primary`): Income
  - Red (`colors.error`): Expense
  - Yellow (`colors.tertiary`): Transfer
- **FAB**: Create new transaction
- **Actions**: Tap row to view detail, tap edit icon to modify

#### 2. Wallets (wallets/)

- **List**: All wallets with balances, last updated timestamp
- **Add Wallet**: FAB at bottom, uses reusable wallet-form
- **Detail Page**: View wallet details, edit or delete options
- **Real-Time Balance**: Updates reflect in main header balance

#### 3. Reports (report.tsx)

- **Monthly Breakdown**: Bar chart comparing income vs. expense by month
- **Filters**: Month/year selector to view historical data
- **Insight Cards**: Total income, total expense, net balance for selected period

#### 4. Settings (settings.tsx)

- **User Info**: Display name + Google profile photo
- **Notification Settings**: Toggle for Notification Listener permission
- **Supported Apps List**: Full list of apps UangKu listens to
- **Logout**: Sign out and return to auth screen

### 🔐 Security & Storage

**Storage Strategy: Secure-First**

- **SecureStore** (Encrypted): Used for ALL sensitive data
  - Authentication tokens (`@uangku/headless_token`)
  - User credentials / metadata

**Token Management**

- Access token: Stored in SecureStore after sign-in
- Headless/background handler reads token directly from SecureStore to authenticate `POST /notifications/sync`
- Automatic cleanup: Token cleared on logout

**Sensitive Data**

- All transactions and wallet data stored remotely (server-side)
- Local Zustand store acts as cache only
- AuthStore persists minimal user metadata in SecureStore
- **No pending transaction queue** — transaction data travels inside `notification.data`, not SecureStore

**API Security**

- All requests include `Authorization: Bearer <token>` header
- 401 responses trigger auto-logout and redirect to auth screen

**Notification Service Security**

- Background notification handler does NOT store parsed transactions locally
- Token is read from SecureStore at the moment the user taps **Konfirmasi**
- If token is missing or invalid (401), the notification remains so the user can retry or create manually
- No sensitive data exposed in notification body (only Rp amount + app label)

### 🚀 Getting Started

#### Installation

```bash
# Install dependencies
npm install

# Install Expo CLI globally (if not already)
npm install -g expo-cli

# Configure Google Sign-In (required)
# 1. Update Google OAuth credentials in android/app/build.gradle
# 2. Set environment variables in .env.local
```

#### Development

```bash
# Start development server
npm start

# Run on Android emulator
npm run android
```

#### Environment Variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_BASE_URL=https://your-server.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
```

### 📊 Supported Financial Apps

Defined in `constants/supported-apps.ts` via `SUPPORTED_APPS_CONFIG`. Allowlist matching uses **exact package names** (`ALLOWED_APP_NAMES`).

**M-Banking**: BCA mobile (`com.bca`), livin (`id.bmri.livin`), BRImo (`id.co.bri.brimo`), wondr (`id.bni.wondr`), Jago (`com.jago.digitalbanking`), SeaBank (`id.co.bankbkemobile.digitalbank`)

**E-Wallet**: ShopeePay (`com.shopeepay.id`), GoPay (`com.gojek.gopay`), OVO (`ovo.id`), DANA (`id.dana`)

Users can also add **Cash** as a manual wallet for non-digital funds.

**Note**: To add or remove supported apps, update `SUPPORTED_APPS_CONFIG` in `constants/supported-apps.ts`. The `ALLOWED_APP_NAMES` array is derived automatically from that config — no separate regex to maintain.

### 🔌 Notification Listener Requirements

**Android Only**: Requires `NotificationListenerService` permission (`RNAndroidNotificationListenerHeadlessJs` headless task)

**Additional permission**: `POST_NOTIFICATIONS` for scheduling local push notifications with action buttons

### 🤝 Contributing

Please follow the coding standards outlined in `copilot-instructions.md`:

- Use TypeScript for all code
- Follow React Native Paper design patterns
- Keep forms in reusable components
- Maintain clean separation of concerns
- Keep notification service logic modular across `handler.ts`, `parser.ts`, `setup.ts`, `sync.ts`

### 📝 License & Contact

**Author**: Developed for the Indonesian fintech community
**Support**: Submit issues and feature requests via GitHub

---

<a name="project-brief"></a>

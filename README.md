# README.md

## UangKu – Automated Financial Tracker for Indonesians (Android Only)

### Overview

**UangKu** is an Android-exclusive mobile financial management application designed specifically for Indonesians who hold accounts across multiple banks and e-wallets. By automatically "listening" to transaction notifications from popular financial apps, UangKu consolidates scattered funds into a single, unified view—eliminating the need for manual transaction logging.

**Platform**: Android only (iOS not supported due to native notification interception requirements)

### 🎯 Problem Statement

Indonesian users typically have money distributed across multiple platforms:

- **Banks**: BCA, Mandiri, BRI
- **E-wallets**: GoPay, OVO, Dana, Jago
- **Other Services**: Shopee, SeaBank

Manually tracking balances and transactions across these platforms is tedious, error-prone, and time-consuming. UangKu solves this by intercepting transaction notifications in real-time and automatically recording them with a user-friendly confirmation workflow.

### ✨ Key Features

1. **Notification-Based Tracking**: Automatically parses notifications from 20+ financial apps using intelligent regex filtering
2. **Confirmation-Driven Workflow**: Sends push notifications for user approval before recording transactions
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
- **Authentication**: Google Sign-In + JWT tokens cached for headless tasks
- **Local Storage**: AsyncStorage + SecureStore
- **Icons**: MaterialCommunityIcons via @expo/vector-icons
- **Charts**: react-native-gifted-charts
- **Notifications**: react-native-android-notification-listener

#### Project Structure

```
uangku-mobile/
├── app/                          # Expo Router file-based routing
│   ├── auth.tsx                 # Authentication screen (Google Sign-In)
│   ├── modal.tsx                # Modal routes
│   └── (tabs)/                  # Tab-based navigation (main app)
│       ├── index.tsx            # Transactions list
│       ├── wallets/             # Wallet management
│       ├── profile.tsx          # User profile & settings
│       └── report.tsx           # Monthly analytics & reports
├── components/
│   ├── forms/
│   │   ├── transaction-form/    # Reusable transaction CRUD form
│   │   └── wallet-form/         # Reusable wallet CRUD form
│   ├── ui/                      # Reusable UI components
│   ├── inputs/                  # Form inputs (date-picker, dropdown, etc.)
│   └── illustrations/           # SVG illustrations
├── services/
│   └── NotificationService.ts   # Headless listener for notifications
├── store/                        # Zustand stores
│   ├── use-auth-store.ts        # Authentication state
│   ├── use-wallets-store.ts     # Wallets state
│   └── use-transactions-store.ts # Transactions state
├── hooks/
│   └── axios/                   # Custom hooks for API queries & mutations
├── lib/
│   └── axios.ts                 # Centralized Axios instance with interceptors
├── types/                        # TypeScript interfaces
└── utils/                        # Utility functions
```

#### Core Services

**NotificationService.ts** (Secure-Sync Architecture)

- Headless task that runs even when the app is closed
- Regex-based allowlist: `/jago|gojek|gopay|ovo\.id|id\.dana|shopee|bankbkemobile|seabank|sea\.bank|com\.bca|mybca|mandiri|livin|brimo|id\.co\.bri|src\.com\.bni|mewallet|linkaja/i`
- Filters non-transaction notifications (OTP, login alerts, etc.)
- **Parses notification and saves as "Pending" in SecureStore** (NEW)
- Triggers a local push notification
- **Does NOT call Backend API** (NEW) — Only Foreground Sync (app open) handles API submission
- When app is resumed, Foreground Sync checks SecureStore for pending records and initiates confirmation flow

**API Integration (axios.ts)**

- Centralized Axios instance with base URL from environment
- Request interceptor: Adds JWT Bearer token to all requests
- Response interceptor: Handles 401 errors by redirecting to auth

### 🔄 User Flows

#### New User Onboarding

1. **Sign-In Screen**: Google Sign-In / Sign-Up
2. **Introduction Screen**: Explains UangKu's value proposition (minimalist design)
3. **Permission Request**: Request Notification Listener permission
4. **Wallet Checklist**: Auto-populated list of supported apps based on ALLOWED_APPS_REGEX
   - User selects which wallets to create
   - Initial balance input for each wallet
5. **Main App**: Redirects to Transaction List with empty history

#### Existing User Login

1. **Sign-In Screen**: Google Sign-In only
2. **Main App**: Directly to Transaction List (preserving previous session)

#### Notification Confirmation Flow

1. Notification arrives from supported app
2. Headless task parses the notification
3. Saves parsed data as "Pending" in SecureStore
4. Triggers a local push notification to user
5. **When app is open/resumed**, Foreground Sync checks SecureStore
6. Auto-navigates user to `/transactions/confirm` (Confirmation Screen)
7. User sees:
   - Source app
   - Transaction amount
   - Detected wallet (auto-matched, can be modified)
   - Original notification date/time
   - Empty category field (user must assign)
   - Optional note field
8. **User confirms and assigns category** (critical user action)
9. On confirm: POST /transactions sent to backend
10. On skip: Record removed from SecureStore, no transaction created
11. Transaction appears in main list

### 📱 Screen Guide

#### 1. Transactions (Main Tab / index.tsx)

- **Header**: Total balance (aggregated from all wallets), Income, Expense summary
- **Date Navigation**: Left/right arrows + calendar picker for quick date jumping
- **Transaction List**: Grouped by date, color-coded by type
  - Green: Income
  - Red: Expense
  - Yellow: Transfer
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

#### 4. Profile (profile.tsx)

- **User Info**: Display name + Google profile photo
- **Notification Settings**: Toggle for Notification Listener permission
- **Supported Apps List**: Full list of apps UangKu listens to (same as intro screen)
- **Logout**: Sign out and return to auth screen

### 🔐 Security & Storage

**Storage Strategy: Secure-First**

- **SecureStore** (Encrypted): Used for ALL sensitive data
  - Authentication tokens
  - Pending transaction queue (from headless notification listener)
  - User credentials
- **AsyncStorage** (Unencrypted): Reserved for non-sensitive data only
  - UI preferences (theme, language, date format)
  - User display preferences
  - Cache metadata

**Token Management**

- Access token: Stored in SecureStore after sign-in
- Headless Cache: Token cached in SecureStore under `@uangku/headless_token` for background task access
- Automatic Cleanup: Token cleared on logout

**Sensitive Data**

- All transactions and wallet data stored remotely (server-side)
- Local Zustand store acts as cache only
- AuthStore persists minimal user metadata in SecureStore
- Pending transactions queue stored in SecureStore (not AsyncStorage)

**API Security**

- All requests include `Authorization: Bearer <token>` header
- 401 responses trigger auto-logout and redirect to auth screen

**Headless Service Security**

- Background notification listener does NOT make API calls directly
- Instead, it saves parsed data to SecureStore as "pending" records
- Foreground Sync (when app is open) retrieves tokens from Zustand and syncs pending records
- User confirmation on dedicated screen before final transaction creation

### 🚀 Getting Started

#### Installation

```bash
# Install dependencies
npm install

# Install Expo CLI globally (if not already)
npm install -g expo-cli

# Configure Google Sign-In (required)
# 1. Update Google OAuth credentials in ios.plist and android/app/build.gradle
# 2. Set EXPO_PUBLIC_BASE_URL in .env or .env.local
```

#### Development

```bash
# Start development server
npm start

# Run on Android emulator
npm run android

# Web version has limited functionality
npm start --web
```

#### Environment Variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_BASE_URL=https://your-server.com
```

### 📊 Supported Financial Apps

The app automatically listens to notifications from:

**Banks**

- BCA, BCA Mobile
- Mandiri, Mandiri Mobile
- BRI, BRI Mobile

**E-wallets**

- GoPay
- OVO
- Dana
- Jago
- LinkAja

**Others**

- SeaBank
- Shopee
- Mewallet

Users can also add **Cash** as a manual wallet for non-digital funds.

### 🔌 Notification Listener Requirements

**Android Only**: Requires NotificationListenerService permission

**Permission Dialog**: "Display over other apps" permission for local push notifications

### 🤝 Contributing

Please follow the coding standards outlined in `copilot-instructions.md`:

- Use TypeScript for all code
- Follow React Native Paper design patterns
- Keep forms in reusable components
- Maintain clean separation of concerns

### 📝 License & Contact

**Author**: Developed for the Indonesian fintech community
**Support**: Submit issues and feature requests via GitHub

---

<a name="project-brief"></a>

# PRD.md

## Product Requirements Document (PRD)

### UangKu v1.0 – MVP Release

---

### 1. Product Overview

**Product Name**: UangKu  
**Version**: 1.0  
**Platform**: Android (Expo React Native) — Android-only due to native notification interception requirements  
**Target Users**: Indonesians aged 20–45 with 3+ financial accounts  
**Release Timeline**: Q2 2026

#### Product Vision

To become the default financial dashboard for Indonesian users by automatically consolidating transactions from all their banks and e-wallets into a single, intuitive interface.

### 2. Requirements & Features

#### 2.1 Authentication & Onboarding

**Feature 2.1.1: Google Sign-In/Sign-Up**

- Requirement: User identity verification via Google OAuth 2.0
- Implementation:
  - Use `@react-native-google-signin/google-signin` package
  - Store idToken and exchange for JWT accessToken on backend
  - Cache token in SecureStore (secure, persistent storage for sensitive data)
- Acceptance: User can sign in/up in <30 seconds without password

**Feature 2.1.2: New User Onboarding Flow**

- Requirement: Introduce UangKu's value to new users and obtain consent

**Step 1 – Introduction Screen**

- Design: Minimalist, three feature highlight cards + app logo
- Content:
  - Headline: "Kelola uangmu dengan UangKu"
  - Feature cards: Notifikasi Otomatis, Semua Dompet Satu Tempat, Laporan Bulanan
  - Privacy Policy checkbox (required before proceeding)
  - CTA: "Mulai Sekarang" button (disabled until Privacy Policy accepted)
  - Privacy Policy: scrollable dialog with pseudonymization, notification scope, data security, account deletion sections
- Acceptance: Screen loads in <2 seconds; "Mulai Sekarang" only enabled after checkbox ticked

**Step 2 – Permission Request**

- Design: Illustration + bullet point list explaining notification access scope
- Content:
  - "UangKu butuh izin ini untuk mencatat transaksimu otomatis"
  - Bullet points: reads banking/e-wallet notifications only; does not read OTP or personal messages; permission revocable anytime
  - Primary CTA: "Izinkan Akses"
  - Secondary CTA: "Lewati, input manual saja" (skips to main app)
- Behavior:
  - If permission granted → navigate to `/onboarding/wallets`
  - If permission denied or status not "authorized" after 2s → `completeOnboarding()` (goes to main app with limited functionality)
  - If user taps Skip → `completeOnboarding()` immediately
- Acceptance: Permission granted → proceed to Wallet Checklist; denied or skipped → main app

**Step 3 – Wallet Checklist**

- Design: Scrollable list of supported apps with checkboxes
- Data:
  - Pre-populated from `SUPPORTED_APPS_CONFIG` (10 apps)
  - Plus "Cash" option for manual tracking (always first in list)
- Action: For each selected app:
  - Show input field: "Saldo awal" (formatted in Indonesian locale, Rp prefix)
  - Create wallet via `POST /wallets` on continue
- Footer behavior:
  - "Lanjutkan" button: enabled only when ≥1 wallet selected
  - "Lewati untuk sekarang" text button: visible only when no wallet is selected
- Acceptance:
  - User selects wallets → all created with initial balances on "Lanjutkan"
  - User can skip entirely → `completeOnboarding()` with empty wallets list

**Feature 2.1.3: Existing User Login**

- Requirement: Quick sign-in for returning users
- Implementation:
  - Google sign-in only (no separate email/password)
  - Check if user exists (backend returns `isNewUser` flag)
  - If exists: Navigate to Transaction List
  - If new: Show onboarding flow
- Acceptance: <5 second sign-in for existing user with cached credentials

---

#### 2.2 Main Dashboard – Transactions

**Feature 2.2.1: Transaction List with Header Summary**

- Requirement: Display all transactions with real-time balance aggregation

**Header Section**

- **Total Balance**: Sum of all wallet balances
  - Formula: SUM(all active wallets' balances)
  - Auto-updates when transactions are approved
- **Income & Expense Cards** (below total):
  - Income (Green/Primary): Total income for selected date range
  - Expense (Red/Error): Total expense for selected date range
  - Format: "Rp 2.450.000"

- **Acceptance Criteria**:
  - Balances update within 500ms of transaction approval
  - Format follows Indonesian locale (Rp, dots for thousands)

**Date Navigation**

- **Left/Right Arrow Buttons**: Jump to previous/next day
- **Calendar Icon**: Tap to open date picker, select any date
- **Display Format**: "Fri, 23 March 2024"
- **Acceptance**: Can jump 1 year back/forward in <2 seconds

**Transaction List**

- **Grouping**: By date (newest first)
- **Each Row**:
  - Icon (wallet icon or category icon)
  - Description: "Cafe / GoPay" or "Salary / BCA"
  - Amount: "+Rp 500.000" (green) or "-Rp 50.000" (red)
  - Time: "10:30 AM"
- **Tap Action**: Navigate to TransactionDetail screen

**Acceptance Criteria**:

- Loads transactions in <1 second
- Handles 1000+ transactions without lag
- Supports scrolling to load more (pagination)

**Feature 2.2.2: Create Transaction**

- Requirement: Allow users to manually add transactions
- Flow:
  1. Tap "+" FAB button
  2. Navigate to `/transactions/add`
  3. TransactionForm pre-fills:
     - Transaction Type: "Expense" (default)
     - Amount: 0
     - Wallet: First wallet (user can change)
     - Date: Today
     - Category: unselected (user must assign)
  4. User fills in amount, category, optional note
  5. Tap "Save"
  6. Transaction created, return to list
- Acceptance: New transaction appears in list within 500ms

**Feature 2.2.3: Transaction Detail**

- Requirement: View/edit existing transaction
- Screen: `/transactions/[id]`
- Display:
  - Transaction type badge (Income/Expense/Transfer)
  - Amount (large, prominent)
  - Category with icon
  - Wallet(s) involved
  - Date & time
  - Note (if any)
  - Admin fee (if applicable)
- Actions:
  - Edit: Opens TransactionForm with pre-filled data
  - Delete: Confirmation dialog → remove from system
- Acceptance: All details load in <500ms

---

#### 2.3 Wallets Management

**Feature 2.3.1: Wallet List**

- Requirement: Display all user wallets with balances
- Screen: `/wallets`
- Display:
  - Each wallet card: wallet name, current balance, last updated timestamp
  - Total balance in header
- FAB: "+ Add Wallet"
- Acceptance: <1 second load time; balances reflect latest transactions immediately

**Feature 2.3.2: Create/Edit Wallet (WalletForm)**

- Requirement: Add new wallets or modify existing ones
- Form Fields:
  - **Wallet Name**: Text input (e.g., "My GoPay Account")
  - **Balance**: Number input with Indonesian formatting (e.g., "2.500.000")
    - Auto-formats as user types
    - Parses to pure number on submit
- Validation:
  - Name: Required, max 50 characters
  - Balance: Required, must be numeric, ≥ 0
- Submit: "Save Wallet"
- Acceptance:
  - New wallet creates in <1 second
  - Balance input format matches Indonesian locale
  - Edit mode pre-fills all fields

**Feature 2.3.3: Wallet Detail**

- Requirement: View single wallet details and transaction history
- Screen: `/wallets/[id]`
- Display:
  - Wallet name, icon, balance
  - Transaction history filtered to this wallet only
- Actions:
  - Edit: Opens WalletForm
  - Delete: Confirmation → removes wallet
- Acceptance: <500ms load

---

#### 2.4 Reports & Analytics

**Feature 2.4.1: Monthly Report**

- Requirement: Visualize income vs. expense trends
- Screen: `/report`
- Display:
  - **Bar Chart**: Side-by-side bars for each month (last 12 months)
    - Blue: Income
    - Red: Expense
  - **Month/Year Selector**: Dropdown to pick specific month
  - **Summary Cards**:
    - Total Income (green)
    - Total Expense (red)
    - Net Balance (can be + or -)
- Acceptance:
  - Chart renders in <1 second
  - Data updates reflect latest transactions within 500ms

---

#### 2.5 Settings & Profile

**Feature 2.5.1: User Profile**

- Requirement: Display user information and manage settings
- Screen: `/settings`
- Display:
  - Google profile photo (circular avatar)
  - User name from Google account

**Section 2: Notification Settings**

- Toggle: "Enable Notification Listening"
  - On: App intercepts transactions from supported apps
  - Off: No automatic transaction creation

**Section 3: Supported Apps**

- Categorized list of all apps UangKu listens to:
  - **M-Banking**: BCA mobile, livin, BRImo, wondr, Jago, SeaBank
  - **E-Wallet**: ShopeePay, GoPay, OVO, DANA
- Note: "We never store your login credentials or payment info"

**Section 4: Actions**

- Button: "Logout"
  - Confirmation dialog
  - Clear all local data (Zustand stores, tokens)
  - Navigate to `/auth`
- Acceptance: Logout completes in <1 second

---

#### 2.6 Notification Listener Service (THE USP)

**Feature 2.6.1: Headless Notification Interception (Action Button Architecture)**

- Requirement: Listen to transaction notifications even when app is closed, and allow one-tap confirmation directly from the notification

**Architecture – Action Buttons, No Pending Queue**:

```
1. OS sends notification → NotificationService.ts (headless task)
2. Task checks if app is in ALLOWED_APP_NAMES (exact package name match)
3. If match, parse title + text for amount via TransactionParser
4. Filter out non-transaction notifications (OTP, login alerts)
5. Schedule local push notification with two action buttons:
   - "Konfirmasi"
   - "Lewati"
   All parsed data embedded in notification.data
6. STOP – Task ends (no SecureStore pending, no API call)

[User taps "Konfirmasi" button — app can be closed]
7. handler.ts activates (background task: BACKGROUND-TRANSACTION-ACTION)
8. Reads auth token from SecureStore
9. Calls POST /notifications/sync with Bearer token
10. On success: notification auto-dismissed, transaction visible in app
11. On error (401/network): notification remains for retry

[User taps "Lewati" button]
7. Notification dismissed
8. No API call, no transaction created
```

**Allowlist (`ALLOWED_APP_NAMES`)** — derived from `constants/supported-apps.ts`:

```
com.bca | id.bmri.livin | id.co.bri.brimo | id.bni.wondr |
com.jago.digitalbanking | id.co.bankbkemobile.digitalbank |
com.shopeepay.id | com.gojek.gopay | ovo.id | id.dana
```

Matching is **exact** (lowercase string comparison), not regex.

**Supported Apps** (User-facing) — from `SUPPORTED_APPS_CONFIG`:

M-Banking: BCA mobile, livin, BRImo, wondr, Jago, SeaBank  
E-Wallet: ShopeePay, GoPay, OVO, DANA

**Important**: To add or remove supported apps, update `SUPPORTED_APPS_CONFIG` in `constants/supported-apps.ts`. `ALLOWED_APP_NAMES` is derived automatically — no separate regex to maintain.

**Filter Logic (`TransactionParser.isNonTransaction()`)**:

- **Must contain amount**: Looks for "Rp", "IDR", "sebesar", or number patterns
- **Exclude OTP**: If text contains "otp", "kode verifikasi", "verification code"
- **Exclude login alerts**: If text contains "login baru", "masuk dari", "perangkat baru"
- **Acceptance**: <100ms parsing time

**Notification Content**:

- Title: `+Rp 10.000` (income) or `-Rp 50.000` (expense) — formatted in Indonesian locale
- Body: original notification text
- Category: `transaction_actions` (links Konfirmasi/Lewati buttons)
- Data payload: app, appLabel, title, text, date (ISO), amount, transactionTypeId

**Token Handling**:

- Token stored in **SecureStore** (`@uangku/headless_token`)
- Read directly by the notification response handler at button-tap time
- If token missing or expired → API returns 401 → error logged → notification stays (user can retry)

**Acceptance Criteria**:

- Headless task completes before notification disappears from OS queue
- Local push sent within 2 seconds of original notification
- Action buttons visible in notification center and on lock screen
- Tapping "Konfirmasi" creates transaction without opening the app
- No duplicate pending records (transaction data lives in notification.data only)
- Token read from SecureStore at confirmation time, not cached in headless context

---

#### 2.7 Color & Theme System

**Income Transactions**: `colors.primary` (Green)

**Expense Transactions**: `colors.error` (Red)

**Transfer Transactions**: `colors.tertiary` (Yellow)

**Dark Mode**: Auto-detect from system settings

---

### 3. User Flows

#### 3.1 New User Flow

```
[Sign-In]
  ↓
[Google Sign-In]
  ↓
(Backend checks if user exists → isNewUser: true)
  ↓
[Introduction Screen] → agree to Privacy Policy → "Mulai Sekarang"
  ↓
[Permission Screen] → "Izinkan Akses" / "Lewati"
  ↓
[Wallet Checklist] → select apps & enter initial balances → "Lanjutkan" / "Lewati untuk sekarang"
  ↓
[Main App] → Transaction List
```

#### 3.2 Existing User Flow

```
[Sign-In]
  ↓
[Google Sign-In]
  ↓
(Backend checks if user exists → isNewUser: false)
  ↓
[Main App] → Transaction List (with history)
```

#### 3.3 Notification Confirmation Flow

```
[Transaction notification arrives from supported app]
  ↓
[Headless task: check ALLOWED_APP_NAMES]
  ↓
[Parse amount → filter OTP/login alerts]
  ↓
[Schedule local push with "Konfirmasi" + "Lewati" buttons]
  ↓
[User taps "Konfirmasi"]              [User taps "Lewati"]
  ↓                                      ↓
[handler reads token from SecureStore]  [Notification dismissed]
  ↓                                      ↓
[POST /notifications/sync]             [No transaction created]
  ↓
[Transaction saved → notification dismissed]
```

---

### 4. Technical Specifications

#### 4.1 API Endpoints (Backend Contract)

**POST `/auth/google-sign-in`**

```json
Request: { "idToken": "..." }
Response: {
  "user": { "id": 1, "name": "John", "email": "..." },
  "accessToken": "jwt_token_here",
  "isNewUser": true
}
```

**GET `/transactions`**

```json
Query: ?walletId=1&startDate=2024-01-01&endDate=2024-12-31
Response: [
  { "id": 1, "amount": 50000, "transactionType": "Expense", ... }
]
```

**POST `/transactions`**

```json
Request: {
  "amount": 50000,
  "transactionTypeId": 2,
  "transactionCategoryId": 5,
  "walletId": 1,
  "createdAt": "2024-03-23",
  "note": "..."
}
Response: { "id": 1, ... }
```

**GET/POST/PATCH/DELETE `/wallets`**

- CRUD operations for wallet management

**POST `/notifications/sync`**

```json
Request: {
  "app": "com.gojek.gopay",
  "title": "GoPay Debit",
  "text": "Rp 50.000 from GoPay",
  "date": "2024-03-23T14:30:00.000Z"
}
Response: { "transactionId": 1, "status": "confirmed" }
```

#### 4.2 Data Models

**User**

```typescript
interface User {
  id: string;
  identifierHash: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}
```

**Wallet**

```typescript
interface Wallet {
  id: number;
  name: string;
  balance: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
```

**Transaction**

```typescript
interface Transaction {
  id: number;
  amount: number;
  adminFee: number;
  transactionType: TransactionType; // Income | Expense | Transfer
  transactionCategory: TransactionCategory;
  transactionWallets: TransactionWallet[];
  note: string;
  importSource: string; // 'notification' | 'manual'
  createdAt: string;
  updatedAt: string;
}
```

**TransactionsStore State**

```typescript
interface TransactionState {
  selectedDate: Date;
  transactions: Transaction[];
  summary: TransactionSummary | undefined;
  needsRefetch: boolean;
}
```

#### 4.3 Environment Variables

```env
EXPO_PUBLIC_BASE_URL=https://api.uangku.app
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
```

---

### 5. Non-Functional Requirements

| Requirement               | Target                                   |
| ------------------------- | ---------------------------------------- |
| **App Load Time**         | <3 seconds on 4G                         |
| **Transaction List Load** | <1 second for 1000 items                 |
| **API Response Time**     | <500ms (p95)                             |
| **Offline Support**       | Partial (local store, sync on reconnect) |
| **Crash Rate**            | <0.1%                                    |
| **Battery Drain**         | <5% per hour of background listening     |
| **Security Rating**       | OWASP Top 10 compliant                   |
| **Accessibility**         | WCAG 2.1 AA                              |

---

### 6. Future Roadmap (Post-MVP)

**Version 1.1** (60 days post-launch)

- Recurring transaction templates
- Budget alerts
- Export transactions (CSV/PDF)

**Version 1.2** (120 days)

- AI-powered spending categorization
- Bill reminders
- Savings goals

**Version 2.0** (6 months)

- Investment tracking
- Peer insights (anonymous)
- Integration with financial advisors

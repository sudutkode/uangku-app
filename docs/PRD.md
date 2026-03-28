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

- Requirement: Introduce UangKu's value to new users

**Step 1 – Introduction Screen**

- Design: Minimalist, single illustration
- Content:
  - Headline: "Manage all your money in one place"
  - Subtitle: "See your balance across all banks and e-wallets instantly"
  - CTA: "Get Started" button
- Acceptance: Screen loads in <2 seconds

**Step 2 – Permission Request**

- Design: OS-level permission dialog (Android: NotificationListenerService only — iOS not supported)
- Content:
  - "UangKu needs access to your notifications to track transactions automatically"
  - "You control which apps we listen to"
- Acceptance: Permission granted → proceed to Wallet Checklist; denied → skip to Transaction List (limited functionality)

**Step 3 – Wallet Checklist**

- Design: ScrollView list of supported apps with toggle switches
- Data:
  - Pre-populated list from ALLOWED_APPS_REGEX (Jago, GoPay, OVO, Dana, BCA, Mandiri, BRI, SeaBank, Shopee, Mewallet, etc.)
  - Plus "Cash" option for manual tracking
- Action: For each selected app:
  - Show input field: "Initial Balance (Rp)"
  - Create wallet with entered balance
- Acceptance:
  - User selects 2+ wallets → all created with balances
  - User can skip this step → defaults to empty wallets list

**Feature 2.1.3: Existing User Login**

- Requirement: Quick sign-in for returning users
- Implementation:
  - Google sign-in only (no separate email/password)
  - Check if user exists (backend returns user metadata)
  - If exists: Navigate to Transaction List
  - If new: Show onboarding flow
- Acceptance: <5 second sign-in for existing user with cached credentials

---

#### 2.2 Main Dashboard – Transactions

**Feature 2.2.1: Transaction List with Header Summary**

- Requirement: Display all transactions with real-time balance aggregation

**Header Section**

- **Total Balance**: Sum of all wallet balances (green, large font)
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
- **Swipe Actions**: (Future) Delete/Edit
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
  3. TransactionForm component pre-fills:
     - Transaction Type: "Expense" (default)
     - Amount: 0
     - Wallet: First wallet (user can change)
     - Date: Today
     - Category: "Uncategorized" (user must select)
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
  - Each wallet card shows:
    - App/bank icon (e.g., GoPay logo)
    - Wallet name (e.g., "GoPay Account")
    - Current balance (e.g., "Rp 1.250.000")
    - Last updated time (e.g., "Updated 2 hours ago")
  - Total balance in header (same as transaction list)
- FAB: "+ Add Wallet"
- Acceptance:
  - <1 second load time
  - Balances reflect latest transactions immediately

**Feature 2.3.2: Create/Edit Wallet (WalletForm)**

- Requirement: Add new wallets or modify existing ones
- Form Fields:
  - **Wallet Name**: Text input (e.g., "My GoPay Account")
  - **Balance**: Number input with Indonesian formatting (e.g., "2.500.000")
    - Auto-formats as user types
    - Parses to pure number on submit
  - (Optional in future) **Wallet Type**: Dropdown (Bank, E-Wallet, Cash)
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
  - Date picker to filter by date range
- Actions:
  - Edit: Opens WalletForm
  - Delete: Confirmation → removes wallet (optional: soft delete if transactions exist)
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
    - Y-axis: Rupiah amount
  - **Month/Year Selector**: Dropdown to pick specific month
  - **Summary Cards**:
    - Total Income (green)
    - Total Expense (red)
    - Net Balance (white/neutral, can be + or -)
- Acceptance:
  - Chart renders in <1 second
  - Data updates reflect latest transactions within 500ms
  - Supports dragging to zoom (nice-to-have)

---

#### 2.5 Settings & Profile

**Feature 2.5.1: User Profile**

- Requirement: Display user information and manage settings
- Screen: `/profile`
- Display:
  - Google profile photo (circular avatar)
  - User name from Google account
  - Email

**Section 2: Notification Settings**

- Toggle: "Enable Notification Listening"
  - On: App intercepts transactions from supported apps
  - Off: No automatic transaction creation
- Explanation: "UangKu will send you a notification to confirm each transaction"

**Section 3: Supported Apps**

- Categorized list of all apps UangKu listens to:
  - **Banks**: BCA mobile, livin, BRImo, wondr, Jago, SeaBank
  - **Wallets**: ShopeePay, GoPay, OVO, DANA
- Note: "We never store your login credentials or payment info"

**Section 4: Actions**

- Button: "Logout"
  - Confirmation dialog
  - Clear all local data (Zustand stores, tokens)
  - Navigate to `/auth`
- Acceptance: Logout completes in <1 second

---

#### 2.6 Notification Listener Service (THE USP)

**Feature 2.6.1: Headless Notification Interception (Secure-Sync Architecture)**

- Requirement: Listen to transaction notifications even when app is closed, with secure background processing

**Architecture – No Direct API from Headless**:

```
1. OS sends notification → NotificationService.ts (headless task)
2. Task checks if app matches ALLOWED_APPS_REGEX
3. If match, parse title + text for amount
4. Filter out non-transaction notifications (OTP, login alerts)
5. Save parsed data as "Pending" record in SecureStore
6. Trigger a local push notification to user
   (e.g., "GoPay: Confirm Rp 50.000 debit?")
7. STOP – Do NOT call backend API from headless task

[Later, when app is in Foreground]
8. Foreground Sync service fetches pending records from SecureStore
9. Sends API request to backend with verified auth token (from Zustand)
10. User navigates to dedicated Confirmation Screen
11. User verifies amount, wallet, assigns category
12. Final POST /transactions sent
```

**Allowlist (ALLOWED_APPS_REGEX)**:

The NotificationService listens to package names matching:

```regex
/jago|gojek|gopay|ovo\.id|id\.dana|shopee|bankbkemobile|seabank|sea\.bank|com\.bca|mybca|mandiri|livin|brimo|id\.co\.bri|src\.com\.bni|mewallet|linkaja/i
```

**Supported Apps** (User-facing):

Defined in `SUPPORTED_APPS_LIST` export from `constants/supported-apps.ts`:
BCA, BCA Mobile, Mandiri, BRI, BRI Mobile, BNI, GoPay, OVO, DANA, Jago, Mewallet, LinkAja, Shopee, SeaBank

**Important**: To update the list of supported apps, modify `SUPPORTED_APPS_LIST` in `constants/supported-apps.ts`. Ensure `ALLOWED_APPS_REGEX` is kept in sync for proper notification package matching.

**Filter Logic (isNonTransactionNotification)**:

- **Must contain amount**: Regex looks for "Rp", "IDR", "sebesar", or number patterns
- **Exclude OTP**: If text contains "otp", "kode verifikasi", "verification code"
- **Exclude login alerts**: If text contains "login baru", "masuk dari", "perangkat baru"
- **Acceptance**: <100ms parsing time, <1% false positives

**CRITICAL: Confirmation-Based Flow (with Dedicated Screen)**

**Background Task** (Headless Service):

1. **Parse Notification**: Extract app, title, text, amount
2. **Save as Pending**: Store in SecureStore with timestamp and parsed data
3. **Trigger Local Push**: Send a local push notification to user
   ```
   "GoPay: Confirm Rp 50.000 debit?"
   [Open App]
   ```
4. **Do NOT hit backend**: Headless task ends here (no API calls)

**Foreground (When App is Open/Resumed)**:

5. **App initializes Foreground Sync**: Checks SecureStore for pending transactions
6. **Auto-navigate to Confirmation Screen**: If pending records exist, navigate user to `/transactions/confirm`
7. **User Verification & Category Assignment**:
   - Display: App name, amount, wallet name (auto-matched from available wallets)
   - User can modify wallet selection
   - User assigns Category (Groceries, Transport, Food, etc. — NOT pre-filled)
   - User adds optional Note
8. **Final Submission**:
   - On "Confirm": POST /transactions sent with user-assigned category
   - On "Skip": Remove from pending, discard
9. **Cleanup**: Delete from SecureStore on success
10. **Fallback**: If pending records older than 24 hours and not confirmed, auto-discard

**Token Caching for Headless**:

- Token stored in **SecureStore** (secure, persistent storage)
- Reason: SecureStore provides proper encryption for authentication tokens

**Pending Transactions Queue**:

- Pending transactions stored in **SecureStore**
- Each pending record includes: app name, amount, parsed date, timestamp
- Foreground Sync periodically checks SecureStore and syncs with backend
- Cleared on successful API submission

**Auto-Parsing Categories**:

- Notifications no longer auto-fit into a "Notification" category
- Instead, user assigns Category manually on the Confirmation Screen (Groceries, Transport, Food, etc.)
- Note field preserves original notification text for audit trail
- This gives users full control and prevents miscategorization

- **Acceptance Criteria**:
  - Headless task completes before notification disappears from OS queue
  - Local push sent within 2 seconds of original notification
  - App launches with Foreground Sync checking for pending records
  - Confirmation Screen loads with pre-populated amount, wallet, date, time
  - User can modify wallet and category before submission
  - No duplicates (check for identical transaction within 5 minutes)
  - Token always available in SecureStore (test: kill app, receive notification, task still runs)

---

#### 2.7 Color & Theme System

**Income Transactions**:

- Color: `colors.primary` (Green, #2E7D32)
- Badge, icon, text all use primary

**Expense Transactions**:

- Color: `colors.error` (Red, #D32F2F)
- Badge, icon, text all use error

**Transfer Transactions**:

- Color: `colors.tertiary` (Yellow, #FBC02D)
- Badge, icon, text all use tertiary

**Dark Mode**:

- Auto-detect from system settings
- Override in profile (future feature)

---

### 3. User Flows

#### 3.1 New User Flow

```
[Sign-In]
  ↓
[Google Sign-In]
  ↓
(Backend checks if user exists)
  ↓
[User is NEW]
  ↓
[Introduction Screen] → "Get Started"
  ↓
[Permission Screen] → Allow/Skip
  ↓
[Wallet Checklist] → Select & add initial balances
  ↓
[Main App] → Transaction List (empty)
```

#### 3.2 Existing User Flow

```
[Sign-In]
  ↓
[Google Sign-In]
  ↓
(Backend checks if user exists)
  ↓
[User EXISTS]
  ↓
[Main App] → Transaction List (with history)
```

#### 3.3 Notification Confirmation Flow

```
[User receives notification from supported app]
  ↓
[Headless task parses notification]
  ↓
[Check: Amount + no OTP/login alert?]
  ↓
[YES] → Send confirmation push to user
  ↓
[User sees: "Confirm: Wallet – Amount?"]
  ↓
[APPROVE] → Create transaction, redirect to transaction detail (optional)
[SKIP] → Discard, no transaction created
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
  "app": "gopay",
  "title": "GoPay Debit",
  "text": "Rp 50.000 from GoPay",
  "date": 1711270800000
}
Response: { "transactionId": null, "status": "confirmation_pending" }
```

**POST `/notifications/confirm`**

```json
Request: { "notificationId": "uuid", "approved": true }
Response: { "transactionId": 1 } OR { "status": "skipped" }
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

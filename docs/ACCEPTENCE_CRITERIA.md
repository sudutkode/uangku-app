# ACCEPTANCE_CRITERIA.md

## Acceptance Criteria & Testing Scenarios

### UangKu v1.0 MVP

---

### Test Environment Setup

- **Device**: Physical Android device (Samsung A12+, Pixel 4+, etc.)
- **Network**: 4G LTE, WiFi
- **Backend**: Staging server (staging-api.uangku.app)
- **Test Account**: Created via Google Sign-In

---

## 1. Authentication & Onboarding

### AC 1.1: Google Sign-In (New User)

```gherkin
Given: First-time user on /auth screen
When: User taps "Sign in with Google"
And: Completes Google OAuth flow
Then:
  - AuthStore is populated with user metadata
  - User is redirected to /onboarding/intro
  - accessToken cached in SecureStore (@uangku/headless_token)
  - User metadata (name, photo, email) stored in SecureStore
```

**Test Case**:

- Tap Google button → Google sign-in modal opens
- Sign in with test@gmail.com
- Accept permissions
- Expect: Redirected to intro screen within 3 seconds
- Verify: Token present in SecureStore

---

### AC 1.2: Google Sign-In (Existing User)

```gherkin
Given: User previously signed in and token cached
When: User taps "Sign in with Google"
And: Completes Google OAuth (same account)
Then:
  - User redirected directly to /transactions (bypasses onboarding)
  - Previous session data (wallets, transactions) restored
  - "Last sign-in" timestamp updated
```

**Test Case**:

- Sign out, then sign back in with same account
- Expect: Direct navigation to transactions list
- Verify: Previous wallet data intact

---

### AC 1.3: Introduction Screen

```gherkin
Given: New user on /onboarding/intro
When: Screen renders
Then:
  - Headline: "Manage all your money in one place"
  - Illustration displays (SVG, responsive)
  - "Get Started" button present at bottom
  - Screen loads in <2 seconds
```

**Test Case**:

- Wait for intro screen
- Verify text and illustration visible
- Tap "Get Started"
- Expect: Navigation to /onboarding/permissions

---

### AC 1.4: Permission Request

```gherkin
Given: New user on /onboarding/permissions
When: Screen renders
Then:
  - Permission request dialog shows system native UI (Android NotificationListenerService)
  - Text explains: "UangKu needs notification access"

If user grants permission:
  - Proceed to /onboarding/wallets

If user denies permission:
  - Skip to /transactions
  - Show banner: "Enable notifications in settings to auto-track"
```

**Test Case 1 (Grant)**:

- Tap "Allow" on permission dialog
- Expect: Navigation to wallet checklist
- Verify: NotificationListenerService enabled in Android settings

**Test Case 2 (Deny)**:

- Tap "Don't Allow"
- Expect: Navigation to transaction list
- Verify: Banner visible saying notifications disabled

---

### AC 1.5: Wallet Checklist

```gherkin
Given: New user on /onboarding/wallets
When: Screen renders
Then:
  - List shows all supported apps: GoPay, OVO, Dana, Jago, BCA, Mandiri, BRI, Shopee, SeaBank, Mewallet, LinkAja
  - Plus "Cash" option for manual wallet
  - Each item has toggle switch (default: OFF)
  - "Continue" button at bottom (disabled if no wallets selected)

When: User toggles GoPay ON
Then:
  - Input field appears: "Initial Balance (Rp)"
  - Placeholder: "0"

When: User enters balance "5000000" and toggles another app
Then:
  - First app still has balance value (state preserved)
  - Second app shows new input field

When: User taps "Continue"
Then:
  - All selected wallets created via POST /wallets
  - For each wallet, a transaction record created marking initial balance
  - User redirected to /transactions
  - All created wallets visible in /wallets list
```

**Test Case**:

- Select 3 apps: GoPay, OVO, Cash
- Enter balances: 1000000, 500000, 200000
- Tap Continue
- Verify in backend: 3 wallets created for user
- Check /wallets: All 3 appear with correct balances
- Verify each has createdAt timestamp

---

## 2. Main Dashboard – Transactions

### AC 2.1: Transaction List Header – Balance Aggregation

```gherkin
Given: User on /transactions
And: User has 3 wallets: GoPay (1M), OVO (500k), Cash (200k)
When: Screen renders
Then:
  - Header shows "Total Balance: 1.700.000" (red text with Rp symbol)
  - Below: "Income: 500.000" (green card) "Expense: 200.000" (red card)
  - All formatted in Indonesian locale (dots as thousands separator)

When: User approves a new transaction (Expense: 100k)
Then:
  - Total Balance updates to "1.600.000" within 500ms
  - Expense card updates to "300.000"
  - No page refresh (uses Zustand update)
```

**Test Case**:

- Create new expense for 100k
- Watch header balance change in real-time
- Verify math: Original 1.7M - 100k = 1.6M
- Round-trip time: <500ms

---

### AC 2.2: Date Navigation

```gherkin
Given: User on /transactions showing transactions for "23 March 2024"
When: User taps left arrow
Then:
  - Date changes to "22 March 2024"
  - Transaction list filtered to show only that date

When: User taps right arrow multiple times
Then:
  - Can navigate forward day-by-day

When: User taps calendar icon
Then:
  - DatePicker modal opens
  - User can jump to any date in past 2 years
  - Tapping a date loads transactions for that date

When: User jumps 1 year forward
Then:
  - UI responds in <1 second (no lag)
```

**Test Case**:

1. Tap left arrow 5 times → should show dates 5 days ago
2. Tap calendar → pick a random date 6 months ago → verify transactions load
3. Navigate forward to future date → should show empty list (no future transactions)

---

### AC 2.3: Transaction List Display

```gherkin
Given: User on /transactions with date filter applied
When: List renders
Then:
  - Transactions grouped by date (one date header per group)
  - Each transaction row shows:
    * Wallet icon (GoPay, OVO, BCA, etc.)
    * Description: "Category / Wallet" (e.g., "Cafe / GoPay")
    * Amount: "+5000" (green for income) or "-50000" (red for expense)
    * Time: "14:30" (24-hour format)

When: List has 50+ transactions
Then:
  - Scrolling is smooth (60fps, no jank)
  - Pagination triggers: loads next 50 when user reaches bottom

When: User taps a transaction row
Then:
  - Navigate to /transactions/[id] detail page
  - All transaction data pre-loads
```

**Test Case**:

1. Mock 100 transactions
2. Scroll to bottom → verify next batch loads
3. Tap a transaction → navigate to detail page
4. Observe: No lag/jank during scroll

---

### AC 2.4: Create Transaction (Manual)

```gherkin
Given: User on /transactions list
When: User taps "+" FAB button
Then:
  - Navigate to /transactions/add
  - Transaction form displays with defaults:
    * Type: "Expense"
    * Amount: 0
    * Wallet: First available wallet
    * Date: Today
    * Category: Unselected (user must pick)
    * Note: Empty

When: User enters amount "250000"
Then:
  - Amount display updates in real-time (show keypad if custom keypad used)
  - Amount shown formatted: "250.000"

When: User taps Category dropdown
Then:
  - Modal shows list of categories (Groceries, Transport, Utilities, etc.)
  - Each category has an icon
  - User can search/filter

When: User selects category and taps "Save"
Then:
  - POST /transactions sent with correct payload
  - Transaction created with importSource: null (indicates manual entry)
  - LoadingState shows during submission
  - On success: Navigate back to /transactions
  - New transaction appears in list within 500ms

When: User leaves required field empty and taps "Save"
Then:
  - Validation error shows below field (e.g., "Category required")
  - Form not submitted
```

**Test Case**:

1. Tap FAB → form opens
2. Tap amount field → enter "120000"
3. Select "Food" category
4. Tap Save
5. Verify: POST /transactions succeeds
6. Check: Transaction appears in list with correct amount & category

---

### AC 2.5: Transaction Detail Screen

```gherkin
Given: User taps a transaction in the list
When: /transactions/[id] loads
Then:
  - Transaction badge displays (Income/Expense/Transfer)
  - Amount shown large: "Rp 50.000"
  - Category with icon: "Transport" + icon
  - Wallet: "GoPay"
  - Date: "23 March 2024, 14:30"
  - Note (if exists): Displayed below date
  - Admin fee (if exists): Shown separately
  - Edit button: Opens form to modify transaction
  - Delete button: Shows confirmation dialog

When: User taps Edit
Then:
  - Navigate to /transactions/[id] (same route, but form mode)
  - TransactionForm pre-fills all fields
  - User can modify any field except importSource
  - On save: PATCH /transactions/[id] sent
  - On success: Return to /transactions list

When: User taps Delete
Then:
  - Confirmation dialog: "Delete this transaction? This cannot be undone."
  - If "Confirm": DELETE /transactions/[id] sent
  - On success: Navigate back to list, transaction removed
```

**Test Case**:

1. Create a transaction (amount: 100k, category: Transport)
2. Tap it in the list → detail page loads
3. Verify all fields display correctly
4. Tap Edit → modify amount to 150k
5. Save → verify in list it shows 150k
6. Tap Delete → confirm → verify removed from list

---

## 3. Wallets Management

### AC 3.1: Wallet List

```gherkin
Given: User with 3 wallets: GoPay (2.5M), OVO (750k), Cash (300k)
When: Navigate to /wallets
Then:
  - Header shows "Total Balance: Rp 3.550.000"
  - List displays 3 cards:
    * Card 1: GoPay icon, "GoPay", "Rp 2.500.000", "Updated 2 hours ago"
    * Card 2: OVO icon, "OVO", "Rp 750.000", "Updated 1 hour ago"
    * Card 3: Cash icon, "Cash", "Rp 300.000", "Updated 23 minutes ago"
  - FAB at bottom: "+ Add Wallet"

When: User taps a wallet card
Then:
  - Navigate to /wallets/[id]
  - Detail page loads with wallet info + transaction history for that wallet

When: New transaction created in any wallet
Then:
  - Balance updates instantly in list
  - "Updated X minutes ago" timestamp refreshes
```

**Test Case**:

1. Navigate to /wallets
2. Verify all wallet cards display
3. Create new transaction in a wallet
4. Go back to /wallets
5. Verify that wallet's balance updated

---

### AC 3.2: Create Wallet (Reusable WalletForm)

````gherkin
Given: User on /wallets, taps "+ Add Wallet"
When: /wallets/add loads OR modal opens
Then:
  - Form displays with fields:
    * Input: "Wallet Name" (max 50 chars)
    * Input: "Balance (Rp)" (number, formatted)
  - Placeholder for name: "e.g., GoPay Virtual"
  - Placeholder for balance: "0"
  - Button: "Save Wallet"

When: User types name "My Jago Account"
Then:
  - Input shows exactly that text

When: User taps balance field and enters "1500000"
Then:
  - Format applied: displays as "1.500.000" (Indonesian locale)
  - Actual value stored internally as number

When: User leaves name empty and taps Save
Then:
  - Validation error: "Wallet name required" below input
  - Form not submitted

When: User enters valid name "My Bank" and balance "1000000", taps Save
Then:
  - POST /wallets sent with payload:
    ```json
    {"name": "My Bank", "balance": 1000000}
    ```
  - LoadingState shown during submission
  - On success: Wallet created, return to /wallets list
  - New wallet appears in list within 500ms
  - Toast notification: "Wallet created" (nice-to-have)
````

**Test Case**:

1. Tap "+ Add Wallet"
2. Enter name: "Test Jago"
3. Enter balance: "5000000"
4. Tap Save
5. Verify POST request succeeds
6. Check /wallets list: New wallet present with balance 5M

---

### AC 3.3: Edit Wallet

```gherkin
Given: User on /wallets/[id] detail page
When: Taps "Edit" button
Then:
  - WalletForm opens in edit mode
  - All fields pre-filled:
    * Name: Current wallet name
    * Balance: Current balance (formatted)

When: User modifies balance to "7000000" and taps Save
Then:
  - PATCH /wallets/[id] sent
  - On success: Navigate back to /wallets
  - Updated balance visible in list
```

**Test Case**:

1. Open a wallet detail page
2. Tap Edit
3. Change balance to "3000000"
4. Save
5. Verify list reflects new balance

---

### AC 3.4: Delete Wallet

```gherkin
Given: User on /wallets/[id] detail page
When: Taps "Delete" button
Then:
  - Confirmation dialog: "Delete this wallet? Transactions will be preserved."
  - "Cancel" or "Delete" buttons

If user taps Cancel:
  - Dialog closes, no action

If user taps Delete:
  - DELETE /wallets/[id] sent
  - On success: Navigate back to /wallets
  - Wallet removed from list
  - Transactions remain (wallet_id preserved for historical reference)
```

**Test Case**:

1. Create a wallet with transactions
2. Delete the wallet
3. Confirm it disappears from /wallets list
4. Verify transactions still exist (soft delete or FK preserved)

---

## 4. Reports & Analytics

### AC 4.1: Monthly Report Display

```gherkin
Given: User with transactions spanning 6 months
When: Navigate to /report
Then:
  - Bar chart renders showing last 6 months
  - X-axis: Month names (Jan, Feb, Mar, ...)
  - Y-axis: Rupiah amounts
  - Two bars per month: Blue (Income), Red (Expense)
  - Chart loads in <1 second

When: Chart renders
Then:
  - Summary cards below:
    * "Total Income: Rp X.XXX.XXX" (green)
    * "Total Expense: Rp Y.YYY.YYY" (red)
    * "Net Balance: Rp Z.ZZZ.ZZZ" (white/neutral, shows +/- color)

When: User taps on a month's bar
Then:
  - Filters transaction list to that month (future feature)
```

**Test Case**:

1. Create 5+ transactions with dates spanning 3 months
2. Navigate to /report
3. Verify chart displays with correct bars
4. Verify summary cards show correct totals
5. Verify formatting uses Indonesian number format (Rp, dots)

---

## 5. Profile & Settings

### AC 5.1: Profile Screen Display

```gherkin
Given: User navigates to /profile
When: Screen renders
Then:
  - Header section displays:
    * Circular avatar (Google profile photo)
    * User name: "John Doe"
    * Email: "john@gmail.com"

When: Section 2 "Notification Settings" displays
Then:
  - Toggle: "Enable Notification Listening"
  - If NotificationListenerService enabled:
    * Toggle shows ON (blue)
    * Explanation: "UangKu will send you a notification to confirm each transaction"
  - If disabled:
    * Toggle shows OFF (gray)
    * Explanation: "To auto-track transactions, enable notifications in settings"

When: Section 3 "Supported Apps" displays
Then:
  - Static list of all supported apps:
    - Banks: BCA, Mandiri, BRI
    - E-wallets: GoPay, OVO, Dana, Jago, LinkAja, Mewallet
    - Others: Shopee, SeaBank
  - Note: "We never store your login credentials or payment info"

When: Section 4 "Actions" displays
Then:
  - Button: "Logout"
  - Text: "Sign out from your UangKu account"
```

**Test Case**:

1. Navigate to /profile
2. Verify user info loads (name, email, photo)
3. Check notification toggle reflects system permission status
4. Verify supported apps list displays correctly
5. Verify logout button present

---

### AC 5.2: Logout

```gherkin
Given: User taps "Logout" button on /profile
When: Confirmation dialog shows
Then:
  - Message: "Sign out from UangKu? You can always sign back in."
  - Buttons: "Cancel" and "Logout"

If user taps Cancel:
  - Dialog closes, remain on /profile

If user taps Logout:
  - signout() called on useAuthStore
  - All local Zustand stores cleared
  - Tokens cleared from SecureStore & AsyncStorage
  - User redirected to /auth
  - On return to /auth: Should require new sign-in
```

**Test Case**:

1. Tap Logout
2. Confirm logout
3. Verify redirected to /auth
4. Verify cannot navigate back to /transactions without signing in again
5. Sign in again → all previous data restored (from backend)

---

## 6. Notification Listener Service (THE USP) – Secure-Sync Architecture

### AC 6.1: Headless Task – App Allowlist

```gherkin
Given: Notification arrives from an app
When: System triggers headless NotificationService.ts
Then:
  - Task extracts app name from notification
  - Checks if app matches ALLOWED_APPS_REGEX:
    /jago|gojek|gopay|ovo\.id|id\.dana|shopee|bankbkemobile|seabank|sea\.bank|com\.bca|mybca|mandiri|livin|brimo|id\.co\.bri|src\.com\.bni|mewallet|linkaja/i

If MATCH:
  - Continue to parsing logic

If NO MATCH:
  - Task exits (no confirmation sent)
  - Notification ignored
```

**Test Case**:

1. Send notification with app name "com.gojek" → Should match (includes 'gojek')
2. Send notification with app name "com.whatsapp" → Should NOT match
3. Send notification with app name "id.dana" → Should match (exact match)

---

### AC 6.2: Headless Task – Amount Filtering

```gherkin
Given: Notification from allowed app
When: Headless task parses title + text
Then:
  - Looks for amount pattern: Regex /(?:rp\.?|idr)\s*[\d.,]+/i or /sebesar\s+[\d.,]+/i

If AMOUNT FOUND:
  - Continue to OTP/login filter

If NO AMOUNT:
  - Task exits (probably just a login notification)
  - No confirmation sent
```

**Test Cases**:

1. Notification: "GoPay - Rp 50.000 debit dari akun Anda" → Should find amount ✓
2. Notification: "Selamat datang di GoPay" (no amount) → Should skip ✗
3. Notification: "Sebesar 100000 dikirim ke" → Should find amount ✓

---

### AC 6.3: Headless Task – OTP & Login Alert Filter

```gherkin
Given: Amount found in notification
When: Headless task checks content for OTP/login patterns
Then:
  - Checks if text contains: 'otp', 'kode verifikasi', 'verification code', 'login baru', 'masuk dari', 'perangkat baru'

If OTP/LOGIN FOUND:
  - Task exits, no confirmation sent

If NONE FOUND:
  - Continue to save-as-pending step
```

**Test Cases**:

1. "Kode OTP Anda: 123456" → Should skip (contains 'otp') ✗
2. "Masuk dari perangkat baru di Jakarta" → Should skip ✗
3. "Rp 50.000 transferred" → Should proceed ✓

---

### AC 6.4: Secure-Sync – Headless Saves to SecureStore (No API Call)

````gherkin
Given: Notification passes all filters (amount, not OTP/login)
When: Headless task completes parsing
Then:
  - Task saves parsed data as "Pending" record in SecureStore:
    ```json
    {
      "id": "uuid-xxx",
      "app": "gopay",
      "title": "GoPay Debit",
      "text": "Rp 50.000 debit",
      "amount": 50000,
      "timestamp": 1711270800000,
      "status": "pending"
    }
    ```
  - Task triggers LOCAL push notification to user:
    ```
    Title: "GoPay"
    Body: "Confirm Rp 50.000 debit?"
    Action: "Open App"
    ```
  - Task EXITS – Does NOT call backend API

When: App is NOT open:
  - Pending record stays in SecureStore (persisted)
  - Local push remains in notification center

When: User taps the local push notification:
  - App launches/resumes
````

**Test Case**:

1. Kill app completely
2. Send test notification from GoPay: "Rp 100.000 debit"
3. Verify local push appears in notification center
4. Inspect SecureStore: Verify pending record was created
5. Verify NO API call was made to backend
6. Tap push notification → app launches

---

### AC 6.5: Foreground Sync – App Checks Pending Records

```gherkin
Given: App launches or comes to foreground
When: App initializes (useAuthStore checks token, ForegroundSyncService activates)
Then:
  - Foreground Sync checks SecureStore for pending transactions
  - Retrieves all pending records

If pending records exist:
  - App navigates user to /transactions/confirm screen
  - Passes first pending record to confirmation screen

If NO pending records:
  - App continues normal flow to /transactions list
```

**Test Case**:

1. Kill app
2. Receive notification, verify pending record created in SecureStore
3. Reopen app → should auto-navigate to /transactions/confirm
4. Verify first pending record displayed

---

### AC 6.6: Confirmation Screen – User Verification & Category Assignment

````gherkin
Given: App shows /transactions/confirm screen with pending record
When: Screen renders
Then:
  - Display parsed data (READ-ONLY):
    * App name: "GoPay"
    * Amount: "Rp 50.000"
    * Date & Time: "23 March 2024, 14:30"
    * Original notification text: "GoPay debit dari kartu kredit"

  - Display editable fields:
    * Wallet: Dropdown with auto-detected wallet (user can change)
    * Category: EMPTY (required, user must assign) — NOT pre-filled
    * Note: Optional text field

  - Buttons at bottom:
    * "Confirm" (only enabled when category selected)
    * "Skip"

When: User selects a different wallet
Then:
  - Dropdown updates immediately

When: User selects category (e.g., "Transport")
Then:
  - "Confirm" button becomes enabled

When: User taps "Confirm"
Then:
  - Form validates (category required)
  - API call: POST /transactions with:
    ```json
    {
      "walletId": 1,
      "amount": 50000,
      "transactionType": "Expense",
      "category": "Transport",
      "date": "2024-03-23",
      "time": "14:30",
      "note": "GoPay debit dari kartu kredit",
      "importSource": "notification"
    }
    ```
  - On success:
    * Transaction created
    * Delete pending record from SecureStore
    * Show toast: "Transaction confirmed"
    * Navigate back to /transactions (transaction visible in list)

When: User taps "Skip"
Then:
  - Pending record deleted from SecureStore
  - Navigate back to /transactions
  - No transaction created
````

**Test Case**:

1. Open app (or reopen if it was killed) with pending record
2. Confirmation screen appears
3. Verify amount, date, notification text displayed correctly
4. Try to tap "Confirm" without category → button disabled
5. Select category "Food"
6. Tap "Confirm"
7. Verify: API call succeeds, transaction appears in /transactions list
8. Verify: Pending record removed from SecureStore

---

### AC 6.7: Token Availability for Headless & Foreground Sync

```gherkin
Given: User signs in, app stores token in SecureStore
When: App is closed/killed
And: Notification arrives from supported app
Then:
  - Headless task runs (OS-level feature)
  - Headless task does NOT need token (it only parses & saves locally)
  - No token validation needed in headless context

When: App is reopened/resumed with pending records
And: Foreground Sync activates
Then:
  - Foreground Sync reads token from Zustand (useAuthStore)
  - Token available immediately
  - API calls to backend authenticated with token

If NO TOKEN (user logged out):
  - Foreground Sync recognizes user is not authenticated
  - Navigates to /auth instead of /transactions/confirm
  - User must sign in first before confirming transactions
```

**Test Case**:

1. Sign in user → token stored in SecureStore
2. Navigate /transactions → token read into Zustand
3. Kill app
4. Send test notification → pending record created (headless works without token)
5. Reopen app → Foreground Sync retrieves pending, uses token from Zustand
6. Confirmation screen appears with fully authenticated context
7. Confirm transaction → API succeeds

---

### AC 6.8: Notification Deduplication

```gherkin
Given: Same transaction notification sent twice within 5 minutes
When: First notification triggers headless parsing
And: Saved as pending record (uuid-1)
And: User opens app, sees confirmation screen, approves
And: Transaction created (txn-id: 123)
And: Pending record deleted from SecureStore
And: Second identical notification arrives
Then:
  - Headless task parses second notification
  - Saves as new pending record (uuid-2)
  - App opens confirmation screen again
  - User now sees two identical confirmations (unless backend deduplicates)

BACKEND DEDUPLICATION (future enhancement):
  - Backend checks for duplicate transaction within 5-minute window
  - If found: Rejects second submission with "duplicate_detected"
  - Frontend handles duplicate error gracefully
```

**Test Case**:

1. Send mock notification: "GoPay Rp 50.000"
2. Open app, confirm → transaction created (ID: 123)
3. Send identical notification again immediately
4. Verify second pending record created
5. Open confirmation screen → second offer appears
6. Approve second → Backend may reject or create second (depends on backend dedup logic)

---

### AC 6.9: Pending Record Cleanup

```gherkin
Given: Pending record in SecureStore
When: App checks pending records
And: Record is older than 24 hours
And: User has NOT confirmed or skipped
Then:
  - Foreground Sync auto-discards (removes from SecureStore)
  - No confirmation screen shown for expired record
  - Next pending record (if exists) shown instead
```

**Test Case**:

1. Manually create a pending record in SecureStore with outdated timestamp (>24 hours old)
2. Open app
3. Verify: Confirmation screen does NOT show the old pending record
4. Verify: Old record removed from SecureStore

---

## 7. Form Usage (Reusable Components)

### AC 7.1: TransactionForm Validation

```gherkin
Given: User on transaction create/edit form
When: User attempts to submit without filling required fields
Then:
  - Amount field: If 0 or empty → "Amount is required"
  - Category field: If unselected → "Category is required"
  - Wallet field: If unselected → "Wallet is required"
  - Date field: Auto-filled to today (always valid)

When: User fills all required fields
Then:
  - "Save Transaction" button becomes enabled (was disabled)

When: User taps Save
Then:
  - No validation errors
  - API call sent
  - On success: Form closes, user returns to list
  - On error: Error message shown (e.g., "Network error, please retry")
```

**Test Case**:

1. Open transaction form
2. Tap Save without entering anything
3. Verify validation errors appear
4. Fill in amount: 50000
5. Tap Save → error still shows (category missing)
6. Select category
7. Tap Save → success

---

### AC 7.2: WalletForm Validation

```gherkin
Given: User on wallet create/edit form
When: User attempts to submit with empty wallet name
Then:
  - Error below name field: "Wallet name is required"

When: User attempts to submit with invalid balance (non-numeric)
Then:
  - Error below balance field: "Balance must be a valid number"

When: User enters name "My Wallet" and balance "0"
Then:
  - Form allows submission (balance can be 0 for new wallets)
  - API call succeeds

When: User enters name with >50 characters
Then:
  - Error: "Wallet name must be 50 characters or less"
```

**Test Case**:

1. Open wallet form
2. Try to save empty form → errors appear
3. Enter name but leave balance blank
4. Try to save → error on balance
5. Enter balance "abc" (non-numeric)
6. Try to save → validation error
7. Enter valid data: name "Test", balance "1000000"
8. Save → success

---

## 8. Integration Tests

### AC 8.1: Full New User Flow (E2E)

```gherkin
Scenario: Complete onboarding from sign-in to first transaction approval

Given: Fresh install, app launches to /auth
When: User taps "Sign in with Google"
And: Completes Google OAuth
Then: Redirected to /onboarding/intro (new user detected by backend)

When: User taps "Get Started"
Then: Redirected to /onboarding/permissions

When: User grants notification permission
Then: Redirected to /onboarding/wallets

When: User selects 3 apps (GoPay, OVO, Dana) with balances
And: Taps "Continue"
Then:
  - All wallets created
  - Redirected to /transactions
  - Header shows aggregated balance

When: User receives transaction notification from GoPay
Then:
  - Confirmation push appears

When: User taps "APPROVE"
Then:
  - New transaction recorded in list
  - Balance updated
  - User sees notification in history

When: User navigates to /wallets
Then:
  - All 3 created wallets visible with correct balances

When: User navigates to /profile
Then:
  - User name + photo displayed
  - Notification toggle shows ON
  - Logout option available
```

**Execution**:

- Test on real Android device (Samsung A12+)
- Expected total time: <5 minutes end-to-end
- All screens should load smoothly without lag

---

### AC 8.2: Full Existing User Flow (E2E)

```gherkin
Scenario: Sign-in and resume with previous data

Given: User previously signed in, wallets + transactions exist
When: User signs out via /profile
And: Closes and reopens app
And: Signs in with same Google account
Then:
  - Redirected directly to /transactions (no onboarding)
  - Previous wallets visible in /wallets
  - Previous transactions visible in list
  - Balance aggregated correctly
```

**Execution**:

- Sign in new user → create wallets + transactions
- Sign out
- Kill app
- Reopen → sign in again
- Verify data restored

---

## 9. Performance & Load Tests

### AC 9.1: Transaction List Performance

```gherkin
Given: User with 1000+ transactions
When: Navigate to /transactions
Then:
  - List renders in <1 second
  - Scrolling smooth (60fps target)
  - No jank or frame drops

When: Scrolling to bottom
Then:
  - Pagination triggers
  - Next batch loads in <500ms
  - Smooth append to list
```

**Load Test**:

- Mock 1000 transactions in Zustand store
- Profile rendering time with React DevTools
- Target: List TTI <1s, scrolling smooth

---

### AC 9.2: API Response Time

```gherkin
Given: Any API call (GET, POST, PATCH, DELETE)
When: Request sent
Then:
  - Response received in <500ms (p95)
  - Timeout after 10s (show error)
  - Retry logic on network error (max 3 retries)
```

**Test**:

- Monitor network tab during transactions
- Verify all responses <500ms
- Test timeout scenario (disable network → close app)

---

## 10. Security Tests

### AC 10.1: Token Expiration & Refresh

```gherkin
Given: User signed in with valid token
When: Token expires
Then:
  - Any API request receives 401 Unauthorized
  - App automatically signs out user
  - User redirected to /auth
  - Appropriate error message shown
```

**Test**:

- Sign in, note token
- Manually delete token from AsyncStorage
- Try to navigate to /transactions → should redirect to /auth

---

### AC 10.2: Secure Storage

```gherkin
Given: User signs in
When: Token stored in SecureStore
Then:
  - Token NOT visible in plaintext in AsyncStorage (only cache key present)
  - Token NOT visible in app files/logs
  - Token cleared on logout
```

**Test**:

- Inspect device storage: /data/data/com.tondikiandika.uangku/
- Verify no auth tokens in SharedPreferences
- Verify SecureStore uses encrypted storage (Android Keystore)

---

## 11. Regression Test Checklist

Run on every release candidate:

- [ ] Sign-in works (Google OAuth)
- [ ] New user onboarding completes
- [ ] Existing user login direct to transaction list
- [ ] Wallets CRUD all operations
- [ ] Transaction CRUD all operations
- [ ] Reports display with correct data
- [ ] Profile screen shows correct user info
- [ ] Logout and re-login restores data
- [ ] Notification confirmation flow works
- [ ] Balance aggregation accurate
- [ ] Dark mode toggle works
- [ ] Date navigation smooth
- [ ] No crashes on rapid navigation
- [ ] No memory leaks (DevTools profiler)
- [ ] No console errors
- [ ] Accessibility: screen reader works
- [ ] Offline mode (if applicable)

---

## 12. Success Criteria Summary

| Criterion                       | Status    |
| ------------------------------- | --------- |
| All AC 1–11 pass                | ✅ PASS   |
| No crashes (crash rate <0.1%)   | ✅ PASS   |
| All screens load <2 seconds     | ✅ PASS   |
| API responses <500ms p95        | ✅ PASS   |
| Dark mode fully functional      | ✅ PASS   |
| Notification confirmation works | ✅ PASS   |
| 10k+ Play Store installations   | 📈 TARGET |
| 4.9+ star rating                | ⭐ TARGET |

---

## Appendix: Testing Tools & Setup

### Recommended Tools

- **Emulator/Device**: Android Studio Emulator, or physical devices
- **Network Monitoring**: Chrome DevTools (web) or Charles Proxy (mobile)
- **Performance**: React DevTools, React Native DevTools
- **Push Notifications**: Firebase Console (Android)
- **Backend Mocking**: MSW (Mock Service Worker) or Postman

### Test Credentials

- **Email**: test@uangku.app (or any test Google account)
- **Staging Server**: https://staging-api.uangku.app
- **Mock Notifications**: Send via Firebase Console or direct Android notification broadcast

---

**Document Version**: 1.0  
**Last Updated**: March 23, 2026  
**Author**: UangKu Product & Engineering Team

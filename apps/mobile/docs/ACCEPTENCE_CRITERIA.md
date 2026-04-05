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
  - User metadata (username) stored in SecureStore
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
  - App logo visible
  - Headline: "Kelola uangmu dengan UangKu"
  - Three feature cards displayed:
    * "Notifikasi Otomatis" with bell icon
    * "Semua Dompet, Satu Tempat" with wallet icon
    * "Laporan Bulanan" with chart icon
  - Privacy Policy checkbox (unchecked by default)
  - "Mulai Sekarang" button is DISABLED
  - Screen loads in <2 seconds

When: User taps the Privacy Policy link
Then:
  - Scrollable Privacy Policy dialog opens
  - Contains sections: Data Anonim, Pembacaan Notifikasi, Keamanan Data, Penghapusan Akun
  - "Tutup" and "Setuju" buttons visible
  - Tapping "Setuju" checks the checkbox and closes dialog

When: User checks the Privacy Policy checkbox
Then:
  - "Mulai Sekarang" button becomes enabled

When: User taps "Mulai Sekarang"
Then:
  - Navigate to /onboarding/permissions
```

**Test Cases**:

1. Open intro screen → verify "Mulai Sekarang" disabled
2. Tap Privacy Policy link → dialog opens
3. Tap "Setuju" → checkbox checked, dialog closed, button enabled
4. Tap "Mulai Sekarang" → navigate to permissions screen

---

### AC 1.4: Permission Request

```gherkin
Given: New user on /onboarding/permissions
When: Screen renders
Then:
  - Illustration (NotificationIllustration SVG) visible
  - Headline: "Izinkan akses notifikasi"
  - Three bullet points explaining scope:
    * "Membaca notifikasi aplikasi mobile banking & dompet digital anda"
    * "Tidak membaca pesan pribadi, OTP, atau notifikasi non-transaksi"
    * "Kamu bisa cabut izin ini kapan saja di Pengaturan"
  - Primary button: "Izinkan Akses"
  - Secondary button: "Lewati, input manual saja"

When: User taps "Izinkan Akses"
Then:
  - System NotificationListenerService permission dialog shown
  - Loading state on button for 2 seconds (waiting for permission status check)

If permission status === "authorized" after 2s:
  - Navigate to /onboarding/wallets

If permission status !== "authorized" after 2s:
  - completeOnboarding() called → navigate to main app

When: User taps "Lewati, input manual saja"
Then:
  - completeOnboarding() called immediately → navigate to main app
```

**Test Case 1 (Grant)**:

- Tap "Izinkan Akses"
- Grant permission in system dialog
- Expect: Navigation to /onboarding/wallets after ~2 seconds
- Verify: NotificationListenerService enabled in Android settings

**Test Case 2 (Deny)**:

- Tap "Izinkan Akses"
- Deny permission in system dialog
- Expect: Navigate to main app after ~2 seconds

**Test Case 3 (Skip)**:

- Tap "Lewati, input manual saja"
- Expect: Navigate immediately to main app

---

### AC 1.5: Wallet Checklist

```gherkin
Given: New user on /onboarding/wallets
When: Screen renders
Then:
  - "Cash" option at top of list (category: Manual)
  - All supported apps listed below (from SUPPORTED_APPS_CONFIG):
    M-Banking: BCA mobile, livin, BRImo, wondr, Jago, SeaBank
    E-Wallet: ShopeePay, GoPay, OVO, DANA
  - Each item has a Checkbox (default: unchecked)
  - "Lanjutkan" button disabled (no wallets selected)
  - "Lewati untuk sekarang" text button visible

When: User checks an app (e.g., GoPay)
Then:
  - Balance input field appears below: "Saldo awal" with "Rp" prefix
  - "Lanjutkan" button becomes enabled
  - "Lewati untuk sekarang" button is hidden

When: User enters balance "5000000"
Then:
  - Displayed as "5.000.000" (Indonesian locale formatting)
  - State preserved when other apps are toggled

When: User taps "Lanjutkan"
Then:
  - POST /wallets called for each selected app
  - Wallet name = app label (e.g., "GoPay")
  - Balance = parsed integer from formatted input
  - appName = package name (e.g., "com.gojek.gopay"), or null for Cash
  - completeOnboarding() called after all wallets created
  - Navigate to main app

When: No wallets selected and user taps "Lewati untuk sekarang"
Then:
  - completeOnboarding() called → navigate to main app
  - No wallets created
```

**Test Case**:

- Select GoPay, OVO, Cash
- Enter balances: 1.000.000, 500.000, 200.000
- Tap "Lanjutkan"
- Verify in backend: 3 wallets created with correct names, balances, and appName
- Check /wallets: all 3 visible

---

## 2. Main Dashboard – Transactions

### AC 2.1: Transaction List Header – Balance Aggregation

```gherkin
Given: User on /transactions
And: User has 3 wallets: GoPay (1M), OVO (500k), Cash (200k)
When: Screen renders
Then:
  - Header shows "Total Balance: Rp 1.700.000"
  - Below: Income and Expense summary cards for selected date
  - All formatted in Indonesian locale (Rp, dots as thousands separator)

When: New transaction confirmed (Expense: 100k)
Then:
  - Total Balance updates to "Rp 1.600.000" within 500ms
  - Expense card updates accordingly
  - No page refresh (Zustand state update)
```

**Test Case**:

- Note current balance
- Confirm a new expense transaction (100k)
- Verify header balance decreases by 100k within 500ms

---

### AC 2.2: Date Navigation

```gherkin
Given: User on /transactions
When: User taps left arrow
Then: Date changes to previous day, transaction list filters accordingly

When: User taps right arrow
Then: Date changes to next day

When: User taps calendar icon
Then: DatePicker modal opens; selecting a date loads transactions for that date

When: User jumps 1 year forward
Then: UI responds in <1 second
```

---

### AC 2.3: Transaction List Display

```gherkin
Given: User on /transactions
When: List renders
Then:
  - Transactions grouped by date (newest first)
  - Each row: wallet icon, "Category / Wallet" description, colored amount, time
  - Income: green (colors.primary)
  - Expense: red (colors.error)
  - Transfer: yellow (colors.tertiary)

When: User taps a row
Then: Navigate to /transactions/[id]
```

---

### AC 2.4: Create Transaction (Manual)

```gherkin
Given: User on /transactions list
When: User taps "+" FAB
Then: Navigate to /transactions/add with default form values

When: User fills amount, category, and taps "Save"
Then:
  - POST /transactions sent (importSource: null for manual)
  - Navigate back to list
  - New transaction visible within 500ms

When: Required field is empty
Then:
  - Validation error shown
  - Form not submitted
```

---

### AC 2.5: Transaction Detail Screen

```gherkin
Given: User taps a transaction row
When: /transactions/[id] loads
Then:
  - All transaction fields displayed (type, amount, category, wallet, date, note, adminFee)
  - Edit and Delete actions available

When: User edits and saves
Then: PATCH /transactions/[id] sent; updated data visible in list

When: User deletes
Then: DELETE /transactions/[id] sent; transaction removed from list
```

---

## 3. Wallets Management

### AC 3.1–3.4: Wallet CRUD

_(No changes from previous version — wallet create, edit, delete, and list behavior unchanged.)_

---

## 4. Reports & Analytics

### AC 4.1: Monthly Report Display

```gherkin
Given: User with transactions spanning multiple months
When: Navigate to /report
Then:
  - Bar chart renders: Blue (Income) and Red (Expense) bars per month
  - Summary cards: Total Income, Total Expense, Net Balance
  - All amounts in Indonesian locale format
  - Chart loads in <1 second
```

---

## 5. Settings & Profile

### AC 5.1: Settings Screen Display

```gherkin
Given: User navigates to /settings
When: Screen renders
Then:
  - User profile section: avatar, name
  - Notification Settings toggle (reflects system permission status)
  - Supported Apps section:
    * M-Banking: BCA mobile, livin, BRImo, wondr, Jago, SeaBank
    * E-Wallet: ShopeePay, GoPay, OVO, DANA
  - Logout button present
```

---

### AC 5.2: Logout

```gherkin
Given: User taps "Logout"
When: Confirmation dialog shown and user confirms
Then:
  - All Zustand stores cleared
  - Tokens cleared from SecureStore
  - Navigate to /auth

When: User signs in again
Then: Previous data restored from backend
```

---

## 6. Notification Listener Service – Action Button Architecture

### AC 6.1: Headless Task – App Allowlist (Exact Match)

```gherkin
Given: Notification arrives from an app
When: Headless NotificationService.ts is triggered
Then:
  - Extracts app package name (lowercased)
  - Checks against ALLOWED_APP_NAMES (exact string comparison):
    com.bca, id.bmri.livin, id.co.bri.brimo, id.bni.wondr,
    com.jago.digitalbanking, id.co.bankbkemobile.digitalbank,
    com.shopeepay.id, com.gojek.gopay, ovo.id, id.dana

If MATCH → continue to parsing
If NO MATCH → task exits silently
```

**Test Cases**:

1. `com.gojek.gopay` → match ✓
2. `com.whatsapp` → no match ✗
3. `id.dana` → match ✓
4. `id.bmri.livin` → match ✓ (note: not "mandiri" regex — exact name)

---

### AC 6.2: Headless Task – Amount Extraction

```gherkin
Given: Notification from allowed app
When: Headless task calls TransactionParser.extractAmount(combined)
Then:
  - Detects amount patterns: "Rp", "IDR", "sebesar", numeric formats

If AMOUNT FOUND → continue
If NO AMOUNT → task exits
```

**Test Cases**:

1. "GoPay - Rp 50.000 debit dari akun Anda" → 50000 ✓
2. "Selamat datang di GoPay" → skip ✗
3. "Sebesar 100000 dikirim ke" → 100000 ✓

---

### AC 6.3: Headless Task – OTP & Login Alert Filter

```gherkin
Given: Amount found in notification
When: TransactionParser.isNonTransaction(combined) is called
Then:
  - Checks for: 'otp', 'kode verifikasi', 'verification code', 'login baru', 'masuk dari', 'perangkat baru'

If OTP/LOGIN → task exits
If NONE → continue to notification scheduling
```

**Test Cases**:

1. "Kode OTP Anda: 123456" → skip ✗
2. "Masuk dari perangkat baru" → skip ✗
3. "Rp 50.000 transferred" → proceed ✓

---

### AC 6.4: Headless Task – Schedule Push Notification with Action Buttons

```gherkin
Given: Notification passes allowlist, amount, and OTP checks
When: Headless task calls Notifications.scheduleNotificationAsync
Then:
  - Local push notification scheduled with:
    * Title: "+Rp 50.000" (income) or "-Rp 50.000" (expense)
    * Body: original notification text
    * categoryIdentifier: "transaction_actions"
    * data: { type, app, appLabel, title, text, date (ISO), amount, transactionTypeId }
  - Two action buttons visible: "Konfirmasi" and "Lewati"
  - Task EXITS — no SecureStore write, no API call

When: App is NOT open:
  - Push notification appears in notification center
  - Buttons visible on lock screen and notification shade

When: Notification is dismissed by user (swipe away, not button tap):
  - No transaction created
  - No data persisted anywhere
```

**Test Case**:

1. Kill app completely
2. Trigger test notification from GoPay: "Rp 100.000 debit"
3. Verify push notification appears with Konfirmasi + Lewati buttons
4. Verify NO pending record in SecureStore
5. Verify NO API call made

---

### AC 6.5: Action Button – "Konfirmasi"

```gherkin
Given: User taps "Konfirmasi" on push notification (app closed or open)
When: handler.ts processNotificationResponse is triggered
Then:
  - Extracts transaction data from notification.response.notification.request.content.data
  - Reads auth token from SecureStore
  - Calls POST /notifications/sync with:
    * Authorization: Bearer {token}
    * Body: { app, title, text, date }
  - On success (2xx):
    * Transaction saved to backend
    * Notification dismissed
    * Transaction visible in /transactions when app opened
  - On error (401 / network failure):
    * Error logged
    * Notification remains (user can retry or create manually)
```

**Test Cases**:

1. **Confirm with app closed:**
   - Kill app
   - Receive notification: "BCA mobile - Dana masuk Rp 10.000"
   - Tap "Konfirmasi" (app stays closed)
   - Verify: POST /notifications/sync called with Bearer token
   - Verify: Response 200
   - Open app → Rp 10.000 transaction visible in list

2. **Confirm with app in foreground:**
   - App open on /transactions
   - Notification slides in as banner
   - Tap "Konfirmasi"
   - Verify: POST /notifications/sync called immediately
   - Transaction appears in list (real-time, no navigation)

3. **Token missing (user logged out):**
   - Log out user
   - Trigger notification, tap "Konfirmasi"
   - Verify: 401 returned, error logged, notification stays

---

### AC 6.6: Action Button – "Lewati"

```gherkin
Given: User taps "Lewati" on push notification
When: handler.ts processNotificationResponse is triggered
Then:
  - Notification dismissed
  - No API call made
  - No transaction created
  - App state unchanged
```

**Test Case**:

1. Kill app
2. Trigger notification: "GoPay - Dana masuk Rp 50.000"
3. Tap "Lewati"
4. Verify: Notification dismissed
5. Open app → no new Rp 50.000 transaction

---

### AC 6.7: Amount Extraction Accuracy

```gherkin
Given: Notifications from various supported banks/wallets
When: TransactionParser.extractAmount is called
Then: Correct integer amount extracted regardless of format
```

**Test Cases**:

| Notification Text               | Expected Amount |
| ------------------------------- | --------------- |
| "Dana masuk sebesar Rp 100.000" | 100000          |
| "Rp10.000 pada 23 Mar"          | 10000           |
| "Transfer Rp 50000"             | 50000           |
| "Topup sebesar Rp 500.000"      | 500000          |
| "IDR 1,500,000 received"        | 1500000         |

---

### AC 6.8: Background Task Registration

```gherkin
Given: App is installed on Android
When: App initializes
Then:
  - "BACKGROUND-TRANSACTION-ACTION" task registered via expo-task-manager
  - Task linked to notification responses via Notifications.registerTaskAsync
  - Headless task "RNAndroidNotificationListenerHeadlessJs" registered via AppRegistry
  - Notification channel and "transaction_actions" category set up (Konfirmasi + Lewati buttons)
```

---

### AC 6.9: No Pending Queue (Regression)

```gherkin
Given: Notification flow completes
Then:
  - NO pending records written to SecureStore for transactions
  - NO /transactions/confirm screen navigated to on app open
  - NO ForegroundSyncService running
  - App opens normally to active tab after notification action
```

**Regression Test**:

1. Receive notification, tap "Konfirmasi"
2. Open app → should land on /transactions (default tab), NOT on a confirmation screen
3. Inspect SecureStore → no pending transaction keys found

---

## 7. Form Usage (Reusable Components)

### AC 7.1: TransactionForm Validation

```gherkin
When: User submits without required fields
Then:
  - Amount = 0 or empty → validation error
  - Category unselected → validation error
  - Wallet unselected → validation error

When: All required fields filled
Then: Form submits successfully
```

---

### AC 7.2: WalletForm Validation

```gherkin
When: Name is empty → "Wallet name is required"
When: Name > 50 characters → "Wallet name must be 50 characters or less"
When: Balance is non-numeric → "Balance must be a valid number"
When: Balance = 0 → form allows submission (zero is valid)
```

---

## 8. Integration Tests

### AC 8.1: Full New User Flow (E2E)

```gherkin
Scenario: Complete onboarding from sign-in to first transaction confirmation

Given: Fresh install
When: User signs in with Google (new account)
Then: → /onboarding/intro

When: User agrees to Privacy Policy, taps "Mulai Sekarang"
Then: → /onboarding/permissions

When: User grants notification permission
Then: → /onboarding/wallets

When: User selects 3 wallets with balances, taps "Lanjutkan"
Then: → /transactions (wallets created, header shows aggregated balance)

When: Transaction notification arrives from supported app
Then: Local push with Konfirmasi/Lewati buttons appears

When: User taps "Konfirmasi" (without opening app)
Then: Transaction saved, visible in list when app opened

When: User navigates to /wallets
Then: All 3 wallets visible with correct balances

When: User navigates to /settings
Then: Profile, notification toggle, supported apps list, logout all present
```

---

### AC 8.2: Full Existing User Flow (E2E)

```gherkin
Given: User previously signed in with wallets and transactions
When: User signs out and signs in again (same account)
Then:
  - No onboarding shown
  - Directed to /transactions with full history
  - Wallets intact
  - Balance aggregated correctly
```

---

## 9. Performance & Load Tests

### AC 9.1: Transaction List Performance

| Scenario                | Target         |
| ----------------------- | -------------- |
| Load 1000 transactions  | <1 second      |
| Scrolling               | 60fps, no jank |
| Pagination (next batch) | <500ms         |

### AC 9.2: API Response Time

- p95 response time: <500ms
- Timeout: 10 seconds (show error)
- Retry: max 3 retries on network error

---

## 10. Security Tests

### AC 10.1: Token Expiration

```gherkin
Given: Token expires
When: Any API request sent
Then:
  - 401 Unauthorized received
  - User auto-signed out
  - Redirect to /auth
```

### AC 10.2: Secure Storage

```gherkin
Given: User signs in
Then:
  - Token stored in SecureStore (Android Keystore encrypted)
  - Token NOT visible in SharedPreferences or plain files
  - Token cleared on logout
```

---

## 11. Regression Test Checklist

Run on every release candidate:

- [ ] Sign-in works (Google OAuth)
- [ ] New user onboarding: Privacy Policy dialog, checkbox gating "Mulai Sekarang"
- [ ] Permission screen: grant/deny/skip all routes correctly
- [ ] Wallet checklist: selection, balance formatting, "Lanjutkan" / "Lewati"
- [ ] Existing user login direct to transaction list
- [ ] Wallets CRUD all operations
- [ ] Transaction CRUD all operations
- [ ] Reports display with correct data
- [ ] Settings screen: notification toggle, supported apps list, logout
- [ ] Notification action buttons: "Konfirmasi" saves transaction, "Lewati" discards
- [ ] Konfirmasi works with app completely closed
- [ ] No pending records written to SecureStore for transactions
- [ ] No confirmation screen shown on app open after notification action
- [ ] Balance aggregation accurate after confirmed transactions
- [ ] Dark mode works
- [ ] Date navigation smooth
- [ ] No crashes on rapid navigation
- [ ] No memory leaks
- [ ] Supported apps list matches SUPPORTED_APPS_CONFIG (10 apps: 6 banks + 4 wallets)

---

## 12. Success Criteria Summary

| Criterion                         | Status    |
| --------------------------------- | --------- |
| All AC 1–11 pass                  | ✅ PASS   |
| No crashes (crash rate <0.1%)     | ✅ PASS   |
| All screens load <2 seconds       | ✅ PASS   |
| API responses <500ms p95          | ✅ PASS   |
| Dark mode fully functional        | ✅ PASS   |
| Notification action buttons work  | ✅ PASS   |
| No pending queue / confirm screen | ✅ PASS   |
| 10k+ Play Store installations     | 📈 TARGET |
| 4.9+ star rating                  | ⭐ TARGET |

---

## Appendix: Testing Tools & Setup

### Recommended Tools

- **Device**: Android Studio Emulator or physical devices (Samsung A12+, Pixel 4+)
- **Network Monitoring**: Charles Proxy (mobile)
- **Performance**: React DevTools, React Native DevTools
- **Push Notifications**: Firebase Console (Android)
- **Backend Mocking**: Postman / MSW

### Test Credentials

- **Email**: test@uangku.app (or any test Google account)
- **Staging Server**: https://staging-api.uangku.app
- **Mock Notifications**: Send via Firebase Console or direct Android notification broadcast

---

**Document Version**: 1.1  
**Last Updated**: March 28, 2026  
**Author**: UangKu Product & Engineering Team

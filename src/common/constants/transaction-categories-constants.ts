import {
  BALANCE_CORRECTION_CATEGORY_NAME,
  INITIAL_BALANCE_CATEGORY_NAME,
  NOTIFICATION_CATEGORY_NAME,
} from '.';

export const TRANSACTION_CATEGORIES = [
  // --- 1. SYSTEM & ADJUSTMENT (Bottom of the list) ---
  {
    name: INITIAL_BALANCE_CATEGORY_NAME,
    transactionType: { id: 1 },
    iconName: 'wallet-plus',
  },
  {
    name: BALANCE_CORRECTION_CATEGORY_NAME,
    transactionType: { id: 1 },
    iconName: 'scale-balance',
  },
  {
    name: BALANCE_CORRECTION_CATEGORY_NAME,
    transactionType: { id: 2 },
    iconName: 'scale-balance',
  },

  // --- 2. INVESTMENT & RARE INCOME (Low Frequency) ---
  { name: 'Investasi', transactionType: { id: 1 }, iconName: 'chart-line' },
  {
    name: 'Bunga Bank',
    transactionType: { id: 1 },
    iconName: 'percent-outline',
  },
  { name: 'Refund', transactionType: { id: 1 }, iconName: 'cash-refund' },
  {
    name: 'Bonus',
    transactionType: { id: 1 },
    iconName: 'star-circle-outline',
  },
  {
    name: 'Penjualan',
    transactionType: { id: 1 },
    iconName: 'tag-multiple-outline',
  },

  // --- 3. MONTHLY / LARGE EXPENSES (Mid-Low Frequency) ---
  {
    name: 'Pajak',
    transactionType: { id: 2 },
    iconName: 'file-percent-outline',
  },
  {
    name: 'Edukasi',
    transactionType: { id: 2 },
    iconName: 'book-open-variant',
  },
  { name: 'Elektronik', transactionType: { id: 2 }, iconName: 'laptop' },
  {
    name: 'Perabot Rumah',
    transactionType: { id: 2 },
    iconName: 'sofa-outline',
  },
  { name: 'Liburan', transactionType: { id: 2 }, iconName: 'airplane' },
  {
    name: 'Game',
    transactionType: { id: 2 },
    iconName: 'gamepad-variant-outline',
  },
  {
    name: 'Kecantikan',
    transactionType: { id: 2 },
    iconName: 'creation-outline',
  },
  {
    name: 'Pakaian',
    transactionType: { id: 2 },
    iconName: 'tshirt-crew-outline',
  },

  // --- 4. LIFESTYLE & SOCIAL (Mid Frequency) ---
  {
    name: 'Nonton',
    transactionType: { id: 2 },
    iconName: 'movie-open-outline',
  },
  { name: 'Olahraga', transactionType: { id: 2 }, iconName: 'dumbbell' },
  {
    name: 'Donasi / Amal',
    transactionType: { id: 2 },
    iconName: 'hand-heart-outline',
  },
  { name: 'Obat', transactionType: { id: 2 }, iconName: 'pill' },
  {
    name: 'Sosial',
    transactionType: { id: 2 },
    iconName: 'account-group-outline',
  },
  { name: 'Perbaikan', transactionType: { id: 2 }, iconName: 'tools' },

  // --- 5. TRANSFER & CASHFLOW (Mid-High Frequency) ---
  { name: 'Tarik Tunai', transactionType: { id: 3 }, iconName: 'cash-minus' },
  {
    name: 'Pindah Saldo',
    transactionType: { id: 3 },
    iconName: 'swap-horizontal',
  },
  { name: 'Kirim Uang', transactionType: { id: 3 }, iconName: 'send-outline' },
  {
    name: 'E-Wallet',
    transactionType: { id: 3 },
    iconName: 'cellphone-arrow-down',
  },

  // --- 6. PRIMARY & ROUTINE NEEDS (High Frequency) ---
  {
    name: 'Cicilan / Hutang',
    transactionType: { id: 2 },
    iconName: 'credit-card-clock-outline',
  },
  {
    name: 'Listrik & Air',
    transactionType: { id: 2 },
    iconName: 'flash-outline',
  },
  {
    name: 'Kos / Kontrakan',
    transactionType: { id: 2 },
    iconName: 'home-variant-outline',
  },
  { name: 'Gaji', transactionType: { id: 1 }, iconName: 'cash-multiple' },
  {
    name: 'Sampingan',
    transactionType: { id: 1 },
    iconName: 'briefcase-clock-outline',
  },

  // --- 7. DAILY TRANSACTIONS (Very High Frequency - Appears at the top) ---
  {
    name: 'Top Up',
    transactionType: { id: 3 },
    iconName: 'wallet-plus-outline',
  },
  {
    name: 'Pulsa & Data',
    transactionType: { id: 2 },
    iconName: 'cellphone-wireless',
  },
  {
    name: 'Bensin',
    transactionType: { id: 2 },
    iconName: 'gas-station-outline',
  },
  {
    name: 'Transportasi Umum',
    transactionType: { id: 2 },
    iconName: 'bus-side',
  },
  {
    name: 'Belanja Bulanan',
    transactionType: { id: 2 },
    iconName: 'cart-outline',
  },
  {
    name: 'Kopi & Jajan',
    transactionType: { id: 2 },
    iconName: 'coffee-outline',
  },
  {
    name: 'Makanan & Minuman',
    transactionType: { id: 2 },
    iconName: 'silverware-fork-knife',
  },

  {
    name: NOTIFICATION_CATEGORY_NAME,
    transactionType: { id: 1 },
    iconName: 'cash-sync',
  },
  {
    name: NOTIFICATION_CATEGORY_NAME,
    transactionType: { id: 2 },
    iconName: 'cash-sync',
  },
];

export const TRANSACTION_TYPE_ID: Record<string, number> = {
  income: 1,
  expense: 2,
  transfer: 3,
};

export const NOTIFICATION_CATEGORY_NAME: string = 'Notification';
export const BALANCE_CORRECTION_CATEGORY_NAME: string = 'Koreksi Saldo';

export const TRANSACTION_CATEGORIES = [
  // --- SYSTEM CATEGORIES (Akan punya ID terkecil, muncul paling bawah) ---
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
  {
    name: NOTIFICATION_CATEGORY_NAME,
    transactionType: { id: 3 },
    iconName: 'cash-sync',
  },

  // --- INFREQUENT / OTHERS ---
  { name: 'Rokok', transactionType: { id: 2 }, iconName: 'smoking' },
  { name: 'Minuman', transactionType: { id: 2 }, iconName: 'glass-wine' },
  {
    name: 'Undian',
    transactionType: { id: 2 },
    iconName: 'ticket-percent-outline',
  },
  {
    name: 'Asuransi',
    transactionType: { id: 2 },
    iconName: 'shield-check-outline',
  },
  {
    name: 'Pajak',
    transactionType: { id: 2 },
    iconName: 'file-percent-outline',
  },
  {
    name: 'Anak-anak',
    transactionType: { id: 2 },
    iconName: 'baby-face-outline',
  },
  { name: 'Hewan Peliharaan', transactionType: { id: 2 }, iconName: 'paw' },
  {
    name: 'Donasi',
    transactionType: { id: 2 },
    iconName: 'hand-heart-outline',
  },
  { name: 'Perbaikan', transactionType: { id: 2 }, iconName: 'tools' },
  {
    name: 'Perabot Rumah',
    transactionType: { id: 2 },
    iconName: 'sofa-outline',
  },
  {
    name: 'Properti',
    transactionType: { id: 2 },
    iconName: 'home-variant-outline',
  },

  // --- LOW FREQUENCY / INVESTASI ---
  { name: 'Tarik Tunai', transactionType: { id: 3 }, iconName: 'cash-minus' },
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
  { name: 'Hadiah', transactionType: { id: 2 }, iconName: 'gift-outline' },
  {
    name: 'Edukasi',
    transactionType: { id: 2 },
    iconName: 'book-open-variant',
  },
  {
    name: 'Penjualan',
    transactionType: { id: 1 },
    iconName: 'tag-multiple-outline',
  },
  { name: 'Investasi', transactionType: { id: 1 }, iconName: 'chart-line' },

  // --- LIFESTYLE & HOBBIES ---
  {
    name: 'Kecantikan',
    transactionType: { id: 2 },
    iconName: 'creation-outline',
  },
  { name: 'Mobil', transactionType: { id: 2 }, iconName: 'car-outline' },
  { name: 'Elektronik', transactionType: { id: 2 }, iconName: 'laptop' },
  { name: 'Liburan', transactionType: { id: 2 }, iconName: 'airplane' },
  { name: 'Olahraga', transactionType: { id: 2 }, iconName: 'dumbbell' },
  {
    name: 'Hiburan',
    transactionType: { id: 2 },
    iconName: 'movie-open-outline',
  },
  {
    name: 'Game',
    transactionType: { id: 2 },
    iconName: 'gamepad-variant-outline',
  },

  // --- MID FREQUENCY ---
  {
    name: 'Sampingan',
    transactionType: { id: 1 },
    iconName: 'briefcase-clock-outline',
  },
  {
    name: 'Pakaian',
    transactionType: { id: 2 },
    iconName: 'tshirt-crew-outline',
  },
  {
    name: 'Buah-buahan',
    transactionType: { id: 2 },
    iconName: 'food-apple-outline',
  },
  { name: 'Sayuran', transactionType: { id: 2 }, iconName: 'leaf' },
  {
    name: 'Transfer Bank',
    transactionType: { id: 3 },
    iconName: 'bank-outline',
  },
  {
    name: 'E-Wallet',
    transactionType: { id: 3 },
    iconName: 'cellphone-arrow-down',
  },
  { name: 'Kesehatan', transactionType: { id: 2 }, iconName: 'heart-pulse' },
  {
    name: 'Sosial',
    transactionType: { id: 2 },
    iconName: 'account-group-outline',
  },

  // --- HIGH FREQUENCY (Akan punya ID terbesar, muncul paling atas karena DESC) ---
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
  { name: 'Transportasi', transactionType: { id: 2 }, iconName: 'bus-side' },
  { name: 'Camilan', transactionType: { id: 2 }, iconName: 'cookie-outline' },
  { name: 'Belanja', transactionType: { id: 2 }, iconName: 'cart-outline' },
  { name: 'Gaji', transactionType: { id: 1 }, iconName: 'cash-multiple' },
  {
    name: 'Makanan',
    transactionType: { id: 2 },
    iconName: 'silverware-fork-knife',
  },
];

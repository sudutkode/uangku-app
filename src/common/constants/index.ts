export const TRANSACTION_TYPE_ID: Record<string, number> = {
  income: 1,
  expense: 2,
  transfer: 3,
};

export const NOTIFICATION_CATEGORY_NAME: string = 'Notification';
export const BALANCE_CORRECTION_CATEGORY_NAME: string = 'Koreksi Saldo';

export const TRANSACTION_CATEGORIES = [
  // --- HIGH FREQUENCY ---
  {
    name: 'Makanan',
    transactionType: { id: 2 },
    iconName: 'silverware-fork-knife',
  },
  { name: 'Gaji', transactionType: { id: 1 }, iconName: 'cash-multiple' },
  { name: 'Belanja', transactionType: { id: 2 }, iconName: 'cart-outline' },
  { name: 'Camilan', transactionType: { id: 2 }, iconName: 'cookie-outline' },
  { name: 'Transportasi', transactionType: { id: 2 }, iconName: 'bus-side' },
  {
    name: 'Pulsa & Data',
    transactionType: { id: 2 },
    iconName: 'cellphone-wireless',
  },
  {
    name: 'Top Up',
    transactionType: { id: 3 },
    iconName: 'wallet-plus-outline',
  },

  // --- MID FREQUENCY ---
  {
    name: 'Sosial',
    transactionType: { id: 2 },
    iconName: 'account-group-outline',
  },
  { name: 'Kesehatan', transactionType: { id: 2 }, iconName: 'heart-pulse' },
  {
    name: 'E-Wallet',
    transactionType: { id: 3 },
    iconName: 'cellphone-arrow-down',
  },
  {
    name: 'Transfer Bank',
    transactionType: { id: 3 },
    iconName: 'bank-outline',
  },
  { name: 'Sayuran', transactionType: { id: 2 }, iconName: 'leaf-outline' },
  {
    name: 'Buah-buahan',
    transactionType: { id: 2 },
    iconName: 'food-apple-outline',
  },
  {
    name: 'Pakaian',
    transactionType: { id: 2 },
    iconName: 'tshirt-crew-outline',
  },
  {
    name: 'Sampingan',
    transactionType: { id: 1 },
    iconName: 'briefcase-clock-outline',
  },

  // --- LIFESTYLE & HOBBIES ---
  {
    name: 'Game',
    transactionType: { id: 2 },
    iconName: 'gamepad-variant-outline',
  },
  {
    name: 'Hiburan',
    transactionType: { id: 2 },
    iconName: 'movie-open-outline',
  },
  { name: 'Olahraga', transactionType: { id: 2 }, iconName: 'dumbbell' },
  { name: 'Liburan', transactionType: { id: 2 }, iconName: 'airplane' },
  { name: 'Elektronik', transactionType: { id: 2 }, iconName: 'laptop' },
  { name: 'Mobil', transactionType: { id: 2 }, iconName: 'car-outline' },
  {
    name: 'Kecantikan',
    transactionType: { id: 2 },
    iconName: 'sparkles',
  },

  // --- LOW FREQUENCY / INVESTASI ---
  { name: 'Investasi', transactionType: { id: 1 }, iconName: 'chart-line' },
  {
    name: 'Penjualan',
    transactionType: { id: 1 },
    iconName: 'tag-multiple-outline',
  },
  {
    name: 'Edukasi',
    transactionType: { id: 2 },
    iconName: 'book-open-variant',
  },
  { name: 'Hadiah', transactionType: { id: 2 }, iconName: 'gift-outline' },
  {
    name: 'Bonus',
    transactionType: { id: 1 },
    iconName: 'star-circle-outline',
  },
  {
    name: 'Refund',
    transactionType: { id: 1 },
    iconName: 'cash-refund',
  },
  {
    name: 'Bunga Bank',
    transactionType: { id: 1 },
    iconName: 'percent-outline',
  },

  // --- INFREQUENT / OTHERS ---
  {
    name: 'Properti',
    transactionType: { id: 2 },
    iconName: 'home-variant-outline',
  },
  {
    name: 'Perabot Rumah',
    transactionType: { id: 2 },
    iconName: 'sofa-outline',
  },
  { name: 'Perbaikan', transactionType: { id: 2 }, iconName: 'tools' },
  {
    name: 'Donasi',
    transactionType: { id: 2 },
    iconName: 'hand-heart-outline',
  },
  { name: 'Hewan Peliharaan', transactionType: { id: 2 }, iconName: 'paw' },
  {
    name: 'Anak-anak',
    transactionType: { id: 2 },
    iconName: 'baby-face-outline',
  },
  {
    name: 'Pajak',
    transactionType: { id: 2 },
    iconName: 'file-percent-outline',
  },
  {
    name: 'Asuransi',
    transactionType: { id: 2 },
    iconName: 'shield-check-outline',
  },
  {
    name: 'Undian',
    transactionType: { id: 2 },
    iconName: 'ticket-percent-outline',
  },
  { name: 'Minuman', transactionType: { id: 2 }, iconName: 'glass-wine' },
  { name: 'Rokok', transactionType: { id: 2 }, iconName: 'smoking' },
  {
    name: 'Tarik Tunai',
    transactionType: { id: 3 },
    iconName: 'cash-minus',
  },

  // --- SYSTEM CATEGORIES ---
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
];

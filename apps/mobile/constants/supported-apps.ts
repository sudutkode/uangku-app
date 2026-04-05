const categories = ["M-Banking", "E-Wallet"] as const;

export const SUPPORTED_APPS_CONFIG = [
  // Mobile Banking
  {label: "BCA mobile", name: "com.bca", category: categories[0]},
  {label: "livin", name: "id.bmri.livin", category: categories[0]},
  {label: "BRImo", name: "id.co.bri.brimo", category: categories[0]},
  {
    label: "wondr",
    name: "id.bni.wondr",
    category: categories[0],
  },
  {label: "Jago", name: "com.jago.digitalbanking", category: categories[0]},
  {
    label: "SeaBank",
    name: "id.co.bankbkemobile.digitalbank",
    category: categories[0],
  },

  // E-Wallets
  {label: "ShopeePay", name: "com.shopeepay.id", category: categories[1]},
  {label: "GoPay", name: "com.gojek.gopay", category: categories[1]},
  {label: "OVO", name: "ovo.id", category: categories[1]},
  {label: "DANA", name: "id.dana", category: categories[1]},
];

export const SUPPORTED_APPS_LIST = SUPPORTED_APPS_CONFIG.map(
  (app) => app.label,
);

export const SUPPORTED_APPS_CATEGORIZED = categories.map((cat) => ({
  category: cat,
  apps: SUPPORTED_APPS_CONFIG.filter((app) => app.category === cat).map(
    (app) => app.label,
  ),
}));

export const ALLOWED_APP_NAMES = SUPPORTED_APPS_CONFIG.map((app) => app.name);

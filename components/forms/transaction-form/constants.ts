export const TRANSFER_TYPE_ID = 3;

export interface FormState {
  transactionTypeId: number;
  transactionCategoryId: number;
  walletId: number;
  targetWalletId: number;
  amount: number;
  adminFee: number;
  createdAt: Date;
  note?: string | null;
}

export const NOTIFICATION_CATEGORY_NAME: string = "Notification";

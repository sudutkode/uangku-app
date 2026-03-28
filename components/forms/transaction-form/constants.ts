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

export interface CreateTransactionDto extends Omit<FormState, "createdAt"> {
  createdAt: string; // ISO String untuk JSON
}

export const NOTIFICATION_CATEGORY_NAME: string = "Notification";

export * from './overrides-icons-constants';
export * from './transaction-categories-constants';

export const TRANSACTION_TYPE_ID: Record<string, number> = {
  income: 1,
  expense: 2,
  transfer: 3,
};

export const NOTIFICATION_CATEGORY_NAME: string = 'Notifikasi';
export const BALANCE_CORRECTION_CATEGORY_NAME: string = 'Koreksi Saldo';
export const INITIAL_BALANCE_CATEGORY_NAME: string = 'Saldo Awal';

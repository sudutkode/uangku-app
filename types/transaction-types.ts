import {Wallet} from "./wallet-types";

export interface TransactionType {
  id: number;
  name: "Income" | "Expense" | "Transfer" | string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  iconName: string | null;
  transactionType: TransactionType;
}

export interface TransactionWallet {
  id: number;
  isIncoming: boolean;
  amount: number;
  wallet: Wallet;
}

export interface Transaction {
  id: number;
  amount: number;
  adminFee: number;
  createdAt: string;
  updatedAt: string;
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  transactionWallets: TransactionWallet[];
  note?: string;
  importSource?: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

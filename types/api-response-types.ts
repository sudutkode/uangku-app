import {
  Transaction,
  TransactionCategory,
  TransactionSummary,
  User,
  Wallet,
} from "./";

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetWalletsResponse extends ApiResponse {
  data?: Wallet[];
}

export interface SignInResponse extends ApiResponse {
  data?: {
    user: User;
    accessToken: string;
  };
}

export interface TransactionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    data: Transaction[];
    summary: TransactionSummary;
    pagination: Pagination;
  };
}

export interface TransactionCategoriesResponse extends ApiResponse {
  data?: {data: TransactionCategory[]; pagination: Pagination};
}

export interface WalletsResponse extends ApiResponse {
  data?: Wallet[];
}

export interface MutationTransactionResponse extends ApiResponse {
  data?: Transaction;
}

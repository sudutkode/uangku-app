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

export interface TransactionsResponse extends ApiResponse {
  data: {
    data: Transaction[];
    summary: TransactionSummary;
    pagination: Pagination;
  };
}

export interface TransactionResponse extends ApiResponse {
  data: Transaction;
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

export interface MonthlyReportResponse {
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  summary: TransactionSummary;
  breakdown: {
    expense: {
      categories: {
        categoryId: number;
        categoryName: string;
        iconName: string;
        total: number;
        percentage: number;
      }[];
      adminFee: {
        total: number;
        percentage: number;
      };
    };
    income: {
      categories: {
        categoryId: number;
        categoryName: string;
        iconName: string;
        total: number;
        percentage: number;
      }[];
    };
  };
}

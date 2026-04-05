import {Transaction, TransactionsResponse, TransactionSummary} from "@/types";
import {create} from "zustand";

interface TransactionState {
  selectedDate: Date;
  transactions: Transaction[];
  summary: TransactionSummary | undefined;
  needsRefetch: boolean;

  setSelectedDate: (date: Date) => void;
  setTransactionsData: (data: TransactionsResponse["data"]) => void;
  setNeedsRefetch: (val: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedDate: new Date(),
  transactions: [],
  summary: undefined,
  needsRefetch: false,
};

const useTransactionsStore = create<TransactionState>((set) => ({
  ...initialState,

  setSelectedDate: (date) => set({selectedDate: date}),

  setTransactionsData: (data) =>
    set({
      transactions: data?.data || [],
      summary: data?.summary,
    }),

  setNeedsRefetch: (val) => set({needsRefetch: val}),

  reset: () => set(initialState),
}));

export default useTransactionsStore;

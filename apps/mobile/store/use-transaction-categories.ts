import {TransactionCategoriesResponse, TransactionCategory} from "@/types";
import {create} from "zustand";

interface TransactionCategoryState {
  transactionCategories: TransactionCategory[];
  needsRefetch: boolean;

  setTransactionCategoriesData: (
    data: TransactionCategoriesResponse["data"],
  ) => void;
  setNeedsRefetch: (val: boolean) => void;
}

const initialState = {
  selectedDate: new Date(),
  transactionCategories: [],
  needsRefetch: false,
};

const useTransactionCategoriesStore = create<TransactionCategoryState>(
  (set) => ({
    ...initialState,

    setTransactionCategoriesData: (data) =>
      set({
        transactionCategories: data?.data || [],
      }),

    setNeedsRefetch: (val) => set({needsRefetch: val}),
  }),
);

export default useTransactionCategoriesStore;

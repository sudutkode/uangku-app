import {format} from "date-fns";

import {Dimensions} from "react-native";

export const camelToTitleCase = (params?: string) => {
  if (!params) return "";
  const result = params.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1).trim();
};

export const formatIdr = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getOperatorSymbol = (transactionTypeId: number) => {
  // Asumsikan ID 1 untuk Income, ID 2 untuk Expense
  if (transactionTypeId === 1) return "+ ";
  if (transactionTypeId === 2) return "- ";
  return ""; // Default jika tipe tidak dikenali
};

export const formatDate = (date: Date | string) => {
  return format(date, "yyyy-MM-dd");
};

export const formatDateLabel = (date: Date | string) => {
  return format(date, "dd MMM yyyy").toUpperCase();
};

export const formatMonth = (date: Date | string) => {
  return format(date, "yyyy-MM");
};
export const screenHeight = Dimensions.get("window").height;
export const screenWidth = Dimensions.get("window").width;

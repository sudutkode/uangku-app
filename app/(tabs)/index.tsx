import { StyleSheet, View } from "react-native";

import { Icon, TransactionBadge } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { formatDateLabel } from "@/utils/formatter-utils";
import { List, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const dummyData = {
  "statusCode": 200,
  "success": true,
  "message": "Transactions fetched successfully",
  "data": {
    "data": [
      {
        "id": 14,
        "amount": 75000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:55:00.829Z",
        "updatedAt": "2026-02-17T01:55:00.829Z",
        "transactionType": {
          "id": 1,
          "name": "Income"
        },
        "transactionCategory": {
          "id": 112,
          "name": "Investments",
          "iconName": "chart-line"
        },
        "transactionWallets": [
          {
            "id": 17,
            "isIncoming": true,
            "amount": 75000,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 13,
        "amount": 20000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:52:53.553Z",
        "updatedAt": "2026-02-17T01:52:53.553Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 88,
          "name": "Balance Correction",
          "iconName": "scale-unbalanced"
        },
        "transactionWallets": [
          {
            "id": 16,
            "isIncoming": false,
            "amount": 20000,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 12,
        "amount": 25000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:51:59.328Z",
        "updatedAt": "2026-02-17T01:51:59.328Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 106,
          "name": "Education",
          "iconName": "book-open"
        },
        "transactionWallets": [
          {
            "id": 15,
            "isIncoming": false,
            "amount": 25000,
            "wallet": {
              "id": 8,
              "name": "Seabank",
              "balance": 500000,
              "createdAt": "2026-02-17T01:49:41.378Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 11,
        "amount": 50000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:51:14.538Z",
        "updatedAt": "2026-02-17T01:51:14.538Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 118,
          "name": "Health",
          "iconName": "heart-pulse"
        },
        "transactionWallets": [
          {
            "id": 14,
            "isIncoming": false,
            "amount": 50000,
            "wallet": {
              "id": 8,
              "name": "Seabank",
              "balance": 500000,
              "createdAt": "2026-02-17T01:49:41.378Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 10,
        "amount": 25000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:50:52.953Z",
        "updatedAt": "2026-02-17T01:50:52.953Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 102,
          "name": "Sports",
          "iconName": "dumbbell"
        },
        "transactionWallets": [
          {
            "id": 13,
            "isIncoming": false,
            "amount": 25000,
            "wallet": {
              "id": 8,
              "name": "Seabank",
              "balance": 500000,
              "createdAt": "2026-02-17T01:49:41.378Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 9,
        "amount": 500000,
        "adminFee": 2500,
        "createdAt": "2026-02-17T01:50:21.381Z",
        "updatedAt": "2026-02-17T01:50:21.381Z",
        "transactionType": {
          "id": 3,
          "name": "Transfer"
        },
        "transactionCategory": {
          "id": 115,
          "name": "Bank Transfer",
          "iconName": "building-columns"
        },
        "transactionWallets": [
          {
            "id": 12,
            "isIncoming": true,
            "amount": 500000,
            "wallet": {
              "id": 8,
              "name": "Seabank",
              "balance": 500000,
              "createdAt": "2026-02-17T01:49:41.378Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          },
          {
            "id": 11,
            "isIncoming": false,
            "amount": 502500,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 8,
        "amount": 25000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:47:37.212Z",
        "updatedAt": "2026-02-17T01:47:37.212Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 120,
          "name": "Transportation",
          "iconName": "bus"
        },
        "transactionWallets": [
          {
            "id": 10,
            "isIncoming": false,
            "amount": 25000,
            "wallet": {
              "id": 6,
              "name": "Cash",
              "balance": 75000,
              "createdAt": "2026-02-17T01:42:27.773Z",
              "updatedAt": "2026-02-17T01:47:37.212Z"
            }
          }
        ]
      },
      {
        "id": 6,
        "amount": 100000,
        "adminFee": 2500,
        "createdAt": "2026-02-17T01:46:05.624Z",
        "updatedAt": "2026-02-17T01:46:05.624Z",
        "transactionType": {
          "id": 3,
          "name": "Transfer"
        },
        "transactionCategory": {
          "id": 114,
          "name": "Withdrawal",
          "iconName": "hand-holding-dollar"
        },
        "transactionWallets": [
          {
            "id": 7,
            "isIncoming": true,
            "amount": 100000,
            "wallet": {
              "id": 6,
              "name": "Cash",
              "balance": 75000,
              "createdAt": "2026-02-17T01:42:27.773Z",
              "updatedAt": "2026-02-17T01:47:37.212Z"
            }
          },
          {
            "id": 6,
            "isIncoming": false,
            "amount": 102500,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 4,
        "amount": 50000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:44:51.364Z",
        "updatedAt": "2026-02-17T01:44:51.364Z",
        "transactionType": {
          "id": 2,
          "name": "Expense"
        },
        "transactionCategory": {
          "id": 128,
          "name": "Food",
          "iconName": "utensils"
        },
        "transactionWallets": [
          {
            "id": 4,
            "isIncoming": false,
            "amount": 50000,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      },
      {
        "id": 3,
        "amount": 14500000,
        "adminFee": 0,
        "createdAt": "2026-02-17T01:44:04.563Z",
        "updatedAt": "2026-02-17T01:44:04.563Z",
        "transactionType": {
          "id": 1,
          "name": "Income"
        },
        "transactionCategory": {
          "id": 129,
          "name": "Salary",
          "iconName": "money-bill-wave"
        },
        "transactionWallets": [
          {
            "id": 3,
            "isIncoming": true,
            "amount": 14500000,
            "wallet": {
              "id": 7,
              "name": "BCA",
              "balance": 13797500,
              "createdAt": "2026-02-17T01:43:40.563Z",
              "updatedAt": "2026-02-18T08:29:56.178Z"
            }
          }
        ]
      }
    ],
    "summary": {
      "income": 14575000,
      "expense": 200000,
      "balance": 14375000
    },
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}

const dummyObject = {
  "id": 14,
  "amount": 75000,
  "adminFee": 0,
  "createdAt": "2026-02-17T01:55:00.829Z",
  "updatedAt": "2026-02-17T01:55:00.829Z",
  "transactionType": {
    "id": 1,
    "name": "Income"
  },
  "transactionCategory": {
    "id": 112,
    "name": "Investments",
    "iconName": "chart-line"
  },
  "transactionWallets": [
    {
      "id": 17,
      "isIncoming": true,
      "amount": 75000,
      "wallet": {
        "id": 7,
        "name": "BCA",
        "balance": 13797500,
        "createdAt": "2026-02-17T01:43:40.563Z",
        "updatedAt": "2026-02-18T08:29:56.178Z"
      }
    }
  ]
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Welcome {user?.name}!</Text>
      <List.Item
        title={dummyObject.transactionCategory.name}
        description={formatDateLabel(dummyObject.createdAt)}
        left={props => <Icon {...props} name={dummyObject.transactionCategory.iconName} />}
        right={() => <View style={{ gap: 4, alignItems: "flex-end" }}>
          <Text style={{ fontSize: 14 }}>{dummyObject.transactionType.name === "Income" ? "+" : "-"}{dummyObject.amount}</Text>
          <TransactionBadge isIncome={true}>{dummyObject.transactionWallets[0].wallet.name}</TransactionBadge>
        </View>}
        descriptionStyle={{ fontSize: 10 }}
        titleStyle={{ fontSize: 14 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
});

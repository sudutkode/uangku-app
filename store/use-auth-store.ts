import {SignInResponse, User} from "@/types";
import * as SecureStore from "expo-secure-store";
import {Platform} from "react-native";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import useTransactionsStore from "./use-transactions-store";
import useWalletsStore from "./use-wallets-store";

const isWeb = Platform.OS === "web";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  signin: (payload: SignInResponse) => void;
  signout: () => void;
  isOnboarding: boolean;
  completeOnboarding: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isOnboarding: false,

      signin: ({data}) => {
        set({
          user: data?.user,
          accessToken: data?.accessToken,
          isOnboarding: data?.isNewUser,
        });
      },

      signout: () => {
        set({
          user: null,
          accessToken: null,
          isOnboarding: false,
        });

        useTransactionsStore.getState().reset();
        useWalletsStore.getState().reset();
      },

      completeOnboarding: () => {
        set({
          isOnboarding: false,
        });
      },
    }),
    {
      name: "auth-store",
      storage: isWeb
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            setItem: (key: string, value: string) =>
              SecureStore.setItemAsync(key, value),
            getItem: (key: string) => SecureStore.getItemAsync(key),
            removeItem: (key: string) => SecureStore.deleteItemAsync(key),
          })),
    },
  ),
);

export default useAuthStore;

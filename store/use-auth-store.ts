import {SignInResponse, User} from "@/types";
import * as SecureStore from "expo-secure-store";
import {Platform} from "react-native";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

const isWeb = Platform.OS === "web";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  signin: (payload: SignInResponse) => void;
  signout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      signin: ({data}) => {
        set({user: data?.user, accessToken: data?.accessToken});
      },

      signout: () => {
        set({user: null, accessToken: null});
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

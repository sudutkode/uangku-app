import {useAuthStore} from "@/store";
import axios, {
  isAxiosError,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {router} from "expo-router";

const api: AxiosInstance = axios.create({
  baseURL: "http://10.120.16.6:3000", // process.env.EXPO_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple redirects to /auth when multiple 401 responses are received in a short time
let isRedirecting = false;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;

      useAuthStore.getState().signout();

      router.replace("/auth");

      setTimeout(() => {
        isRedirecting = false;
      }, 2000);
    }
    return Promise.reject(error);
  },
);

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;

    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};

export {api, getErrorMessage};

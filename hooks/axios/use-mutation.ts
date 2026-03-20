import {api, getErrorMessage} from "@/lib/axios";
import {AxiosError, AxiosRequestConfig} from "axios";
import {useCallback, useEffect, useRef, useState} from "react";

type MutationMethod = "post" | "put" | "patch" | "delete";

interface UseMutationReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string;
  mutate: (payload: P) => Promise<T>;
  reset: () => void;
}

interface MutationOptions {
  config?: AxiosRequestConfig;
  method?: MutationMethod;
}

export const useMutation = <T, P>(
  url: string,
  options?: MutationOptions,
): UseMutationReturn<T, P> => {
  const {method = "post", config} = options || {};
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const mutate = useCallback(
    async (payload: P): Promise<T> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError("");

      try {
        const response =
          method === "delete"
            ? await api.delete<T>(url, {
                ...config,
                data: payload,
                signal: abortController.signal,
              })
            : await api[method]<T>(url, payload, {
                ...config,
                signal: abortController.signal,
              });

        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError;
        if (axiosError.code !== "ERR_CANCELED") {
          const messageError = getErrorMessage(axiosError);
          setError(messageError);
        }
        throw axiosError;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [method, url],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError("");
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {data, loading, error, mutate, reset};
};

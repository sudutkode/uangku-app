import {api, getErrorMessage} from "@/lib/axios";
import {AxiosError, AxiosRequestConfig} from "axios";
import {useCallback, useEffect, useRef, useState} from "react";

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export const useFetch = <T>(
  url: string,
  config?: AxiosRequestConfig,
  prevent?: boolean,
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError("");

    try {
      const {data} = await api.get<T>(url, {
        ...config,
        signal: abortController.signal,
      });
      setData(data);
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.code !== "ERR_CANCELED") {
        const messageError = getErrorMessage(axiosError);
        setError(messageError);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(config)]); // Stringify to prevent infinite re-render

  useEffect(() => {
    if (prevent) return;
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, prevent]);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  return {data, loading, error, refetch};
};

import {api} from "@/lib/axios";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {useCallback, useEffect, useState} from "react";

export interface GmailSyncStatus {
  lastSyncAt: string | null;
  hasGmailAccess: boolean;
}

export interface GmailSyncResult {
  imported: number;
  skipped: number;
  failed: number;
  lastSyncAt: string;
}

export function useGmailSync() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<GmailSyncStatus | null>(null);
  const [lastResult, setLastResult] = useState<GmailSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<{data: GmailSyncStatus}>("/gmail/sync-status");
      setStatus(res.data.data);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const triggerSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const tokens = await GoogleSignin.getTokens();
      const res = await api.post<{data: GmailSyncResult}>("/gmail/sync", {
        accessToken: tokens.accessToken,
      });
      const result = res.data.data;
      setLastResult(result);
      setStatus((prev) => ({...prev!, lastSyncAt: result.lastSyncAt}));
      return result;
    } catch (err: any) {
      // 403 = token tidak punya scope Gmail → paksa re-auth
      if (err?.response?.status === 403) {
        await GoogleSignin.signOut();
        await GoogleSignin.signIn();
        return triggerSync(); // coba lagi setelah re-auth
      }
      console.log(err);
      const msg = err?.response?.data?.message ?? "Sync failed";
      setError(msg);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return {syncing, status, lastResult, error, triggerSync, fetchStatus};
}

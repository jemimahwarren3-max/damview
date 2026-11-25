"use client";

import { useState, useEffect, useCallback } from "react";
import { getSyncQueue } from "@/lib/offline/db";
import { processSyncQueue } from "@/lib/offline/sync";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const refreshCount = useCallback(async () => {
    const q = await getSyncQueue();
    setPendingCount(q.length);
  }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    refreshCount();

    const goOffline = () => setIsOffline(true);
    const goOnline = async () => {
      setIsOffline(false);
      setSyncing(true);
      await processSyncQueue();
      await refreshCount();
      setSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    const onMessage = async (e: MessageEvent) => {
      if (e.data?.type === "TRIGGER_SYNC") {
        setSyncing(true);
        await processSyncQueue();
        await refreshCount();
        setSyncing(false);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    const interval = setInterval(refreshCount, 10000);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      clearInterval(interval);
    };
  }, [refreshCount]);

  if (!isOffline && !syncing && !justSynced && pendingCount === 0) return null;

  return (
    <div
      className={`px-4 py-1.5 text-xs font-medium text-center transition-colors ${
        isOffline
          ? "bg-amber-100 text-amber-900"
          : syncing
            ? "bg-blue-100 text-blue-900"
            : justSynced
              ? "bg-green-100 text-green-900"
              : "bg-amber-50 text-amber-800"
      }`}
    >
      {isOffline && (
        <>
          You are offline
          {pendingCount > 0 && ` · ${pendingCount} action${pendingCount > 1 ? "s" : ""} pending sync`}
        </>
      )}
      {!isOffline && syncing && "Syncing..."}
      {!isOffline && justSynced && "Back online — synced!"}
      {!isOffline && !syncing && !justSynced && pendingCount > 0 && (
        <>{pendingCount} action{pendingCount > 1 ? "s" : ""} pending sync</>
      )}
    </div>
  );
}

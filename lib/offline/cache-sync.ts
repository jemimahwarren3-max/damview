"use client";

import { useState, useEffect, useCallback } from "react";
import {
  setCachedRooms,
  setCachedGuests,
  getSyncQueue,
} from "./db";
import { processSyncQueue } from "./sync";

export function useOfflineCache() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const refreshCache = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const [roomsRes, guestsRes] = await Promise.all([
        fetch("/api/offline/rooms"),
        fetch("/api/offline/guests"),
      ]);
      if (roomsRes.ok) {
        const { data } = await roomsRes.json();
        if (data) await setCachedRooms(data);
      }
      if (guestsRes.ok) {
        const { data } = await guestsRes.json();
        if (data) await setCachedGuests(data);
      }
      setLastSynced(new Date());
    } catch {
      // offline or network error — silent
    }
  }, []);

  const refreshQueueCount = useCallback(async () => {
    const queue = await getSyncQueue();
    setPendingSyncCount(queue.length);
  }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = async () => {
      setIsOffline(false);
      await processSyncQueue();
      await refreshQueueCount();
      await refreshCache();
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    // SW might send TRIGGER_SYNC
    const onMessage = async (e: MessageEvent) => {
      if (e.data?.type === "TRIGGER_SYNC") {
        await processSyncQueue();
        await refreshQueueCount();
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    // Initial load
    refreshCache();
    refreshQueueCount();

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [refreshCache, refreshQueueCount]);

  return { isOffline, pendingSyncCount, lastSynced };
}

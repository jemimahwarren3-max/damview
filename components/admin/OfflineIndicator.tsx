"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSyncQueue,
  removeFromSyncQueue,
  type SyncQueueItem,
} from "@/lib/offline/db";
import { processSyncQueue } from "@/lib/offline/sync";
import {
  WifiOff,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const MAX_RETRIES = 5;

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const refreshQueue = useCallback(async () => {
    const q = await getSyncQueue();
    setQueue(q);
    setPendingCount(q.length);
  }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    refreshQueue();

    const goOffline = () => setIsOffline(true);
    const goOnline = async () => {
      setIsOffline(false);
      setSyncing(true);
      await processSyncQueue();
      await refreshQueue();
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
        await refreshQueue();
        setSyncing(false);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    const interval = setInterval(refreshQueue, 10000);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      clearInterval(interval);
    };
  }, [refreshQueue]);

  async function handleRetryAll() {
    if (syncing || isOffline) return;
    setSyncing(true);
    await processSyncQueue();
    await refreshQueue();
    setSyncing(false);
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    await removeFromSyncQueue(id);
    await refreshQueue();
    setRemovingId(null);
  }

  if (!isOffline && !syncing && !justSynced && pendingCount === 0) return null;

  const failedItems = queue.filter((i) => i.retries >= MAX_RETRIES);

  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => pendingCount > 0 && setExpanded(!expanded)}
        className={`w-full px-4 py-1.5 text-xs font-medium text-center transition-colors flex items-center justify-center gap-2 ${
          isOffline
            ? "bg-amber-100 text-amber-900"
            : syncing
              ? "bg-blue-100 text-blue-900"
              : justSynced
                ? "bg-green-100 text-green-900"
                : failedItems.length > 0
                  ? "bg-red-50 text-red-800"
                  : "bg-amber-50 text-amber-800"
        }`}
      >
        {isOffline && <WifiOff className="h-3 w-3" />}
        {syncing && <Loader2 className="h-3 w-3 animate-spin" />}
        {failedItems.length > 0 && !isOffline && !syncing && (
          <AlertTriangle className="h-3 w-3" />
        )}

        <span>
          {isOffline && (
            <>
              You are offline
              {pendingCount > 0 &&
                ` · ${pendingCount} action${pendingCount > 1 ? "s" : ""} pending`}
            </>
          )}
          {!isOffline && syncing && "Syncing..."}
          {!isOffline && justSynced && "Back online — synced!"}
          {!isOffline &&
            !syncing &&
            !justSynced &&
            pendingCount > 0 && (
              <>
                {failedItems.length > 0
                  ? `${failedItems.length} failed · ${pendingCount} pending`
                  : `${pendingCount} action${pendingCount > 1 ? "s" : ""} pending sync`}
              </>
            )}
        </span>

        {pendingCount > 0 &&
          (expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </button>

      {expanded && pendingCount > 0 && (
        <div className="bg-white border-t border-neutral-100 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-600">
              Sync Queue
            </span>
            {!isOffline && (
              <button
                onClick={handleRetryAll}
                disabled={syncing}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`}
                />
                Retry All
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {queue.map((item) => {
              const isFailed = item.retries >= MAX_RETRIES;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    isFailed
                      ? "bg-red-50 border border-red-100"
                      : "bg-neutral-50 border border-neutral-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-neutral-800">
                      {item.action}
                    </span>
                    {item.retries > 0 && (
                      <span
                        className={`ml-2 text-[10px] ${isFailed ? "text-red-600 font-bold" : "text-amber-600"}`}
                      >
                        {isFailed
                          ? "Failed"
                          : `Retry ${item.retries}/${MAX_RETRIES}`}
                      </span>
                    )}
                    <p className="text-[10px] text-neutral-400 truncate">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Remove from queue"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

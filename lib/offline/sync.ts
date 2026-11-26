"use client";

import {
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueItem,
  type SyncQueueItem,
} from "./db";

const MAX_RETRIES = 5;

const ACTION_ENDPOINTS: Record<string, string> = {
  checkInGuest: "/api/offline/check-in",
  checkoutGuest: "/api/offline/checkout",
  processCheckout: "/api/offline/billing",
  updateRoomStatus: "/api/offline/room-status",
};

async function executeItem(item: SyncQueueItem): Promise<boolean> {
  const endpoint = ACTION_ENDPOINTS[item.action];
  if (!endpoint) {
    console.warn(`No endpoint for sync action: ${item.action}`);
    return false;
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item.payload),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !data.error;
  } catch {
    return false;
  }
}

export async function processSyncQueue(): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    const ok = await executeItem(item);
    if (ok) {
      await removeFromSyncQueue(item.id);
      synced++;
    } else {
      await updateSyncQueueItem({ ...item, retries: item.retries + 1 });
      if (item.retries + 1 >= MAX_RETRIES) failed++;
    }
  }

  const remaining = (await getSyncQueue()).length;
  return { synced, failed, remaining };
}

export async function registerSync(): Promise<void> {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await (reg as any).sync.register("damview-sync");
      return;
    } catch {
      // SyncManager not supported — fall through to immediate
    }
  }
  await processSyncQueue();
}

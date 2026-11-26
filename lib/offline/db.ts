const DB_NAME = "damview-offline";
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("rooms"))
        db.createObjectStore("rooms", { keyPath: "id" });
      if (!db.objectStoreNames.contains("guests"))
        db.createObjectStore("guests", { keyPath: "id" });
      if (!db.objectStoreNames.contains("syncQueue"))
        db.createObjectStore("syncQueue", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txGet<T>(store: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      }),
  );
}

function txPutAll<T extends { id: string }>(
  store: string,
  items: T[],
): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const os = tx.objectStore(store);
        os.clear();
        items.forEach((item) => os.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function getCachedRooms() {
  return txGet<Record<string, unknown>>("rooms");
}

export function setCachedRooms(rooms: Record<string, unknown>[]) {
  return txPutAll("rooms", rooms as (Record<string, unknown> & { id: string })[]);
}

export function getCachedGuests() {
  return txGet<Record<string, unknown>>("guests");
}

export function setCachedGuests(guests: Record<string, unknown>[]) {
  return txPutAll(
    "guests",
    guests as (Record<string, unknown> & { id: string })[],
  );
}

export function addToSyncQueue(
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const item: SyncQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    payload,
    timestamp: Date.now(),
    retries: 0,
  };
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("syncQueue", "readwrite");
        tx.objectStore("syncQueue").put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function getSyncQueue(): Promise<SyncQueueItem[]> {
  return txGet<SyncQueueItem>("syncQueue");
}

export function removeFromSyncQueue(id: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("syncQueue", "readwrite");
        tx.objectStore("syncQueue").delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("syncQueue", "readwrite");
        tx.objectStore("syncQueue").put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

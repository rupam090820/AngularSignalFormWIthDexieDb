/// <reference lib="webworker" />

import { environment } from '../environments/environment';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(environment.dbName);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllRows(db: IDBDatabase, table: string): Promise<any[]> {
  return new Promise((resolve) => {
    const tx = db.transaction(table, 'readonly');
    const req = tx.objectStore(table).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

function clearTable(db: IDBDatabase, table: string): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(table, 'readwrite');
    tx.objectStore(table).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

addEventListener('message', async (e: MessageEvent<{ tables?: string[] }>) => {
  const now = Date.now();
  const db = await openDB();

  // If specific tables passed use them, otherwise scan all
  const tables = e.data.tables ?? Array.from(db.objectStoreNames);
  console.log('[Worker] Tables to scan:', tables);

  const cleared: string[] = [];

  for (const table of tables) {
    const rows = await getAllRows(db, table);
    console.log(`[Worker] ${table}:`, rows);

    const hasExpired = rows.some((row) => row.expiresAt != null && row.expiresAt <= now);
    if (hasExpired) {
      await clearTable(db, table);
      cleared.push(table);
      console.log(`[Worker] Cleared entire table: ${table}`);
    }
  }

  db.close();
  postMessage({ status: 'done', cleared });
});

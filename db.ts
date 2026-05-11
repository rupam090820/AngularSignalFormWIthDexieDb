import Dexie, { type EntityTable } from 'dexie';
import { environment } from './src/environments/environment';
/* =========================
   1. TABLE INTERFACES
========================= */

export interface DraftEntry {
  urlId: string;
  createdAt: number;
  expiresAt: number;
}

export interface formDataSetEntry extends DraftEntry {
  data: any;
}

export interface SessionDraft extends DraftEntry {
  data: any;
}

export interface CartItem extends DraftEntry {
  data: any;
}

/* =========================
   2. DB INTERFACE
========================= */

export interface AppDB extends Dexie {
  formDataSet: EntityTable<formDataSetEntry, 'urlId'>;
  sessionDrafts: EntityTable<SessionDraft, 'urlId'>;
  cartItems: EntityTable<CartItem, 'urlId'>;
}
/* =========================
   3. DB INSTANCE
========================= */

export const db = new Dexie(environment.dbName) as AppDB;

/* =========================
   4. SCHEMA (VERSIONING)
========================= */

db.version(8).stores({
  formDataSet: 'urlId, expiresAt',
  sessionDrafts: 'urlId, expiresAt',
  cartItems: 'urlId, expiresAt',
});

/* =========================
   5. OPTIONAL: INITIAL DATA
========================= */

// db.on('populate', async () => {
//   // Todo sample
//   const todoListId: any = await db.todoLists.add({
//     title: 'To Do Today',
//   });

//   await db.todoItems.bulkAdd([
//     { todoListId, title: 'Feed the birds', done: false },
//     { todoListId, title: 'Watch a movie', done: false },
//     { todoListId, title: 'Have some sleep', done: true },
//   ]);

//   // Users
//   const userId: any = await db.users.add({ name: 'John Doe' });

//   // Products
//   const productId = await db.products.add({
//     name: 'Laptop',
//     price: 50000,
//   });

//   // Orders
//   await db.orders.add({
//     userId,
//     total: 50000,
//   });
// });

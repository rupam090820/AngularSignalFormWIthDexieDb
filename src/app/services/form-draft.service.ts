import { Injectable } from '@angular/core';
import { db, AppDB, DraftEntry } from '../../../db';
import { environment } from '../../environments/environment';

type DraftTable = keyof AppDB;

@Injectable({ providedIn: 'root' })
export class FormDraftService {
  private get urlId() {
    return window.location.pathname;
  }

  private table(name: DraftTable) {
    return db[name] as typeof db.formDataSet;
  }

  async load<T>(table: DraftTable): Promise<T | null> {
    const entry = await this.table(table).get(this.urlId);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      await this.table(table).clear();
      return null;
    }
    return entry.data as T;
  }

  async save(table: DraftTable, data: any): Promise<void> {
    const now = Date.now();
    const entry: DraftEntry & { data: any } = {
      urlId: this.urlId,
      data,
      createdAt: now,
      expiresAt: now + environment.expiresIn,
    };
    await this.table(table).put(entry);
  }

  async clear(table: DraftTable): Promise<void> {
    await this.table(table).clear();
  }
}

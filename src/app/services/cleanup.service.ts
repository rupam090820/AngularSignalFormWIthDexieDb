import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { AppDB } from '../../../db';

type DraftTable = keyof AppDB;

@Injectable({ providedIn: 'root' })
export class CleanupService implements OnDestroy {
  isBusy = signal(false);
  isLoggedIn = signal(false);

  private worker = new Worker(new URL('../cleanup.worker', import.meta.url), { type: 'module' });
  private workerMessage$ = new Subject<string[]>();

  constructor() {
    fromEvent<MessageEvent>(this.worker, 'message').subscribe((e) => {
      this.workerMessage$.next(e.data.cleared ?? []);
    });
  }

  runCleanup(table?: DraftTable) {
    this.isBusy.set(true);
    this.worker.postMessage(table ? { tables: [table] } : {});

    return this.workerMessage$.pipe(
      take(1),
      map((cleared) => {
        this.isBusy.set(false);
        return cleared;
      }),
    );
  }

  ngOnDestroy() {
    this.workerMessage$.complete();
    this.worker.terminate();
  }
}

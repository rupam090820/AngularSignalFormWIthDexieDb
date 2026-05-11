import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDraftService } from '../../services/form-draft.service';
import { CleanupService } from '../../services/cleanup.service';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }
    <section class="form-section">
      <div class="form-header">
        <h1>Cart Items</h1>
        <button type="button" class="clear-btn" (click)="clearDraft()">Clear Saved Data</button>
      </div>
      <p class="subtitle">Saved into cartItems table · key: /cart-items · expires in 30 min</p>

      <div class="form-grid">
        <div class="form-group">
          <label>Item Name</label>
          <input [(ngModel)]="model().name" placeholder="Item name" (blur)="saveDraft()" />
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input type="number" [(ngModel)]="model().qty" placeholder="1" (blur)="saveDraft()" />
        </div>
      </div>

      <div class="actions">
        <button (click)="onSubmit()">🛒 Submit Cart</button>
      </div>
    </section>
  `,
})
export class CartItemsComponent implements OnInit {
  private draft = inject(FormDraftService);
  private cleanup = inject(CleanupService);
  toast = signal<string | null>(null);
  private toastTimer: any;

  model = signal({ name: '', qty: 1 });

  async ngOnInit() {
    const saved = await this.draft.load<{ name: string; qty: number }>('cartItems');
    if (saved) this.model.set({ ...this.model(), ...saved });
  }

  async saveDraft() {
    await this.draft.save('cartItems', this.model());
    this.showToast('🛒 Draft auto-saved.');
  }

  async onSubmit() {
    if (!this.model().name.trim()) return;
    this.cleanup.runCleanup('cartItems').subscribe();
    await this.draft.clear('cartItems');
    this.model.set({ name: '', qty: 1 });
    this.showToast('✅ Cart submitted! Table cleared.');
  }

  async clearDraft() {
    await this.draft.clear('cartItems');
    this.model.set({ name: '', qty: 1 });
    this.showToast('🗑️ Draft cleared.');
  }

  showToast(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}

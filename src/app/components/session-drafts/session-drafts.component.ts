import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDraftService } from '../../services/form-draft.service';
import { CleanupService } from '../../services/cleanup.service';

@Component({
  selector: 'app-session-drafts',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }
    <section class="form-section">
      <div class="form-header">
        <h1>Session Drafts</h1>
        <button type="button" class="clear-btn" (click)="clearDraft()">Clear Saved Data</button>
      </div>
      <p class="subtitle">Saved into sessionDrafts table · key: /session-drafts · expires in 30 min</p>

      <div class="form-grid">
        <div class="form-group">
          <label>Draft Title</label>
          <input [(ngModel)]="model().title" placeholder="Draft title" (blur)="saveDraft()" />
        </div>
        <div class="form-group full-width">
          <label>Content</label>
          <textarea [(ngModel)]="model().content" rows="4" placeholder="Draft content..." (blur)="saveDraft()"></textarea>
        </div>
      </div>

      <div class="actions">
        <button (click)="onSubmit()">💾 Submit Draft</button>
      </div>
    </section>
  `,
})
export class SessionDraftsComponent implements OnInit {
  private draft = inject(FormDraftService);
  private cleanup = inject(CleanupService);
  toast = signal<string | null>(null);
  private toastTimer: any;

  model = signal({ title: '', content: '' });

  async ngOnInit() {
    const saved = await this.draft.load<{ title: string; content: string }>('sessionDrafts');
    if (saved) this.model.set({ ...this.model(), ...saved });
  }

  async saveDraft() {
    await this.draft.save('sessionDrafts', this.model());
    this.showToast('💾 Draft auto-saved.');
  }

  async onSubmit() {
    if (!this.model().title.trim()) return;
    this.cleanup.runCleanup('sessionDrafts').subscribe();
    await this.draft.clear('sessionDrafts');
    this.model.set({ title: '', content: '' });
    this.showToast('✅ Draft submitted! Table cleared.');
  }

  async clearDraft() {
    await this.draft.clear('sessionDrafts');
    this.model.set({ title: '', content: '' });
    this.showToast('🗑️ Draft cleared.');
  }

  showToast(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}

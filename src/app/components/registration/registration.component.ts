import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormField, form, required, email, pattern, submit } from '@angular/forms/signals';
import { FormDraftService } from '../../services/form-draft.service';
import { CleanupService } from '../../services/cleanup.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }
    <section class="form-section">
      <div class="form-header">
        <h1>User Registration</h1>
        <button type="button" class="clear-btn" (click)="clearDraft()">Clear Saved Data</button>
      </div>
      <p class="subtitle">Auto-saved on blur · expires in 30 min</p>

      <form (submit)="onSubmit(); $event.preventDefault()">
        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input [formField]="userForm.firstName" placeholder="John" (blur)="saveDraft()" />
            @if (userForm.firstName().touched() && userForm.firstName().errors().length) {
              <span class="error">{{ userForm.firstName().errors()[0].message }}</span>
            }
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input [formField]="userForm.lastName" placeholder="Doe" (blur)="saveDraft()" />
            @if (userForm.lastName().touched() && userForm.lastName().errors().length) {
              <span class="error">{{ userForm.lastName().errors()[0].message }}</span>
            }
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [formField]="userForm.email" placeholder="john@example.com" (blur)="saveDraft()" />
            @if (userForm.email().touched() && userForm.email().errors().length) {
              <span class="error">{{ userForm.email().errors()[0].message }}</span>
            }
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [formField]="userForm.phone" placeholder="+1 123 456 7890" (blur)="saveDraft()" />
            @if (userForm.phone().touched() && userForm.phone().errors().length) {
              <span class="error">{{ userForm.phone().errors()[0].message }}</span>
            }
          </div>
          <div class="form-group full-width">
            <label>Comments</label>
            <textarea [formField]="userForm.comments" rows="3" placeholder="Any details..." (blur)="saveDraft()"></textarea>
          </div>
        </div>
        <div class="actions">
          <button type="submit" [disabled]="userForm().invalid() || userForm().pending()">
            @if (userForm().pending()) { Validating... } @else { Submit Registration }
          </button>
        </div>
      </form>
    </section>
  `,
})
export class RegistrationComponent implements OnInit {
  private draft = inject(FormDraftService);
  private cleanup = inject(CleanupService);
  toast = signal<string | null>(null);
  private toastTimer: any;

  model = signal({ firstName: '', lastName: '', email: '', phone: '', comments: '' });

  userForm = form(this.model, (s) => {
    required(s.firstName, { message: 'First name is required' });
    required(s.lastName, { message: 'Last name is required' });
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Invalid email' });
    required(s.phone, { message: 'Phone is required' });
    pattern(s.phone, /^\+?[0-9\s-]{10,20}$/, { message: 'Invalid phone' });
  });

  async ngOnInit() {
    const saved = await this.draft.load<typeof this.model>('formDataSet');
    if (saved) this.model.set({ ...this.model(), ...saved });
  }

  async saveDraft() {
    await this.draft.save('formDataSet', this.model());
  }

  async clearDraft() {
    await this.draft.clear('formDataSet');
    this.model.set({ firstName: '', lastName: '', email: '', phone: '', comments: '' });
    this.showToast('🗑️ Draft cleared.');
  }

  async onSubmit() {
    await submit(this.userForm, async () => {
      this.cleanup.runCleanup('formDataSet').subscribe();
      await this.draft.clear('formDataSet');
      this.model.set({ firstName: '', lastName: '', email: '', phone: '', comments: '' });
      this.showToast('✅ Registration submitted! Table cleared.');
    });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}

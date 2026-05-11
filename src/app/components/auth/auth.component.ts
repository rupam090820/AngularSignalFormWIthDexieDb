import { Component, inject, signal } from '@angular/core';
import { CleanupService } from '../../services/cleanup.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  template: `
    <div class="auth-bar">
      @if (!cleanup.isLoggedIn()) {
        <button class="login-btn" (click)="onLogin()" [disabled]="cleanup.isBusy()">
          @if (cleanup.isBusy()) { ⏳ Cleaning up... } @else { 🔐 Login }
        </button>
      } @else {
        <span class="logged-in-label">✅ Logged In</span>
        <button class="logout-btn" (click)="onLogout()" [disabled]="cleanup.isBusy()">
          @if (cleanup.isBusy()) { ⏳ Cleaning up... } @else { 🚪 Logout }
        </button>
      }
    </div>
  `,
})
export class AuthComponent {
  cleanup = inject(CleanupService);
  toast = signal<string | null>(null);

  onLogin() {
    this.cleanup.runCleanup().subscribe((cleared) => {
      this.cleanup.isLoggedIn.set(true);
      this.showToast(cleared.length > 0 ? `✅ Logged in. 🧹 Cleared: ${cleared.join(', ')}` : '✅ Logged in.');
    });
  }

  onLogout() {
    this.cleanup.runCleanup().subscribe((cleared) => {
      this.cleanup.isLoggedIn.set(false);
      this.showToast(cleared.length > 0 ? `👋 Logged out. 🧹 Cleared: ${cleared.join(', ')}` : '👋 Logged out.');
    });
  }

  private toastTimer: any;
  showToast(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}

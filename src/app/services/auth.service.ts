import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from '../models/rick-morty.model';

const STORAGE_KEY = 'rickflix_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly sessionSignal = signal<UserSession | null>(this.loadSession());

  readonly currentUser = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);

  constructor(private readonly router: Router) {}

  login(email: string, password: string): { ok: boolean; message?: string } {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { ok: false, message: 'Ingresa tu correo y contraseña para continuar.' };
    }

    if (cleanPassword.length < 4) {
      return { ok: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const rawName = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    const username = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const session: UserSession = {
      username,
      email: cleanEmail,
      avatarColor: '#e50914',
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
    return { ok: true };
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionSignal.set(null);
    this.router.navigate(['/login']);
  }

  private loadSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserSession) : null;
    } catch {
      return null;
    }
  }
}

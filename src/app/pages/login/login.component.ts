import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <header class="login-header">
        <span class="brand-logo">RICKFLIX</span>
      </header>

      <main class="login-container">
        <section class="login-card">
          <h1>Iniciar sesión</h1>
          <p class="subtitle">Ingresa para ver el catálogo de episodios y personajes.</p>

          @if (errorMessage()) {
            <div class="error-banner" role="alert">
              {{ errorMessage() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="login-form">
            <div class="field">
              <label for="email">Correo o usuario</label>
              <input
                id="email"
                name="email"
                type="text"
                [(ngModel)]="email"
                placeholder="ej. rick@rickflix.com"
                autocomplete="username"
                required
              />
            </div>

            <div class="field">
              <label for="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="password"
                placeholder="Mínimo 4 caracteres"
                autocomplete="current-password"
                required
              />
            </div>

            <button type="submit" class="btn-primary">Entrar</button>
          </form>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-primary);
        background-image: linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.8)),
          url('/login-bg.jpg');
        background-size: cover;
        background-position: center;
      }

      .login-header {
        padding: 20px 24px;
        border-bottom: 1px solid #222;
      }

      .brand-logo {
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 1px;
        color: var(--netflix-red);
      }

      .login-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
      }

      .login-card {
        width: 100%;
        max-width: 380px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 32px 28px;
      }

      h1 {
        margin: 0 0 6px;
        font-size: 1.6rem;
      }

      .subtitle {
        margin: 0 0 20px;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .error-banner {
        background: rgba(229, 9, 20, 0.15);
        border: 1px solid var(--netflix-red);
        color: #ffb3b3;
        padding: 10px 12px;
        border-radius: 4px;
        font-size: 0.85rem;
        margin-bottom: 16px;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field label {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }

      .field input {
        padding: 10px 12px;
        border-radius: 4px;
        border: 1px solid #444;
        background: #2b2b2b;
        color: #fff;
        font-size: 0.95rem;
      }

      .field input:focus {
        outline: none;
        border-color: var(--netflix-red);
      }

      .btn-primary {
        margin-top: 6px;
        padding: 11px;
        border: none;
        border-radius: 4px;
        background: var(--netflix-red);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 700;
      }

      .btn-primary:hover {
        background: var(--netflix-red-hover);
      }
    `,
  ],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly errorMessage = signal('');

  onSubmit(): void {
    const result = this.authService.login(this.email, this.password);
    if (!result.ok) {
      this.errorMessage.set(result.message ?? 'Error al iniciar sesión.');
      return;
    }

    this.errorMessage.set('');
    this.router.navigate(['/home']);
  }
}

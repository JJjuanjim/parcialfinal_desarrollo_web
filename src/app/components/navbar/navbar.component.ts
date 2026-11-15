import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <a routerLink="/home" class="brand-logo">RICKFLIX</a>

        <nav class="nav-links" aria-label="Navegación principal">
          <a
            routerLink="/home"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Inicio
          </a>
          <a routerLink="/characters" routerLinkActive="active">
            Listado Personajes
          </a>
          <a routerLink="/episodes" routerLinkActive="active">
            Listado Episodios
          </a>
        </nav>
      </div>

      <div class="navbar-right">
        @if (authService.currentUser(); as user) {
          <span class="username">{{ user.username }}</span>
          <button type="button" class="logout-btn" (click)="authService.logout()">
            Cerrar sesión
          </button>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        position: sticky;
        top: 0;
        height: 60px;
        padding: 0 24px;
        background-color: #111111;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 50;
      }

      .navbar-left {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .brand-logo {
        font-size: 1.5rem;
        font-weight: 900;
        letter-spacing: 1px;
        color: var(--netflix-red);
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .nav-links a {
        color: var(--text-secondary);
        font-size: 0.92rem;
        padding: 4px 6px;
      }

      .nav-links a:hover,
      .nav-links a.active {
        color: #ffffff;
        font-weight: 600;
      }

      .nav-links a.active {
        border-bottom: 2px solid var(--netflix-red);
      }

      .navbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .username {
        font-size: 0.88rem;
        color: var(--text-secondary);
      }

      .logout-btn {
        background: var(--bg-elevated);
        color: #fff;
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.84rem;
      }

      .logout-btn:hover {
        background: var(--netflix-red);
        border-color: var(--netflix-red);
      }

      @media (max-width: 720px) {
        .navbar {
          padding: 0 12px;
        }
        .username {
          display: none;
        }
        .nav-links {
          gap: 10px;
        }
        .nav-links a {
          font-size: 0.82rem;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
}

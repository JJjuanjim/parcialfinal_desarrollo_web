import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiInfo, Episode } from '../../models/rick-morty.model';
import { RickMortyService } from '../../services/rick-morty.service';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    <main class="catalog-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">CATÁLOGO DE EPISODIOS</span>
          <h1>Listado de Episodios</h1>
          <p>Selecciona un episodio para ver su detalle y los personajes que participan.</p>
        </div>

        <form class="filters" (ngSubmit)="applyFilters()">
          <input
            type="text"
            name="search"
            [(ngModel)]="searchTerm"
            placeholder="Buscar episodio (ej. Pilot, Pickle)..."
            class="search-input"
          />
          <button type="submit" class="btn-search">Buscar</button>
        </form>
      </header>

      @if (loading()) {
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <span>Cargando catálogo de episodios...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="empty-state">
          <p>{{ errorMessage() }}</p>
          <button type="button" class="btn-reset" (click)="resetFilters()">
            Mostrar todos
          </button>
        </div>
      } @else {
        @if (info(); as meta) {
          <div class="results-bar">
            <span>{{ meta.count }} episodios encontrados · Página {{ currentPage() }} de {{ meta.pages }}</span>
          </div>
        }

        <section class="episodes-grid">
          @for (ep of episodes(); track ep.id) {
            <a [routerLink]="['/episodes', ep.id]" class="episode-card">
              <div class="card-top">
                <span class="ep-code">{{ ep.episode }}</span>
                <span class="ep-id">#{{ ep.id }}</span>
              </div>

              <h2 class="ep-title">{{ ep.name }}</h2>

              <div class="card-footer">
                <span class="ep-date">Emisión: {{ ep.air_date }}</span>
                <span class="ep-cast">{{ ep.characters.length }} personajes →</span>
              </div>
            </a>
          }
        </section>

        @if (info(); as meta) {
          <nav class="pagination" aria-label="Paginación de episodios">
            <button
              type="button"
              class="page-btn"
              [disabled]="!meta.prev"
              (click)="goToPage(currentPage() - 1)"
            >
              ← Anterior
            </button>
            <span class="page-indicator">Página {{ currentPage() }} / {{ meta.pages }}</span>
            <button
              type="button"
              class="page-btn"
              [disabled]="!meta.next"
              (click)="goToPage(currentPage() + 1)"
            >
              Siguiente →
            </button>
          </nav>
        }
      }
    </main>
  `,
  styles: [
    `
      .catalog-page {
        min-height: calc(100vh - 60px);
        padding: 28px 24px 48px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        flex-wrap: wrap;
        margin-bottom: 28px;
      }

      .eyebrow {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: var(--netflix-red);
        margin-bottom: 6px;
      }

      h1 {
        margin: 0 0 6px;
        font-size: clamp(1.8rem, 3.2vw, 2.5rem);
        font-weight: 800;
      }

      .page-header p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.94rem;
      }

      .filters {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .search-input {
        min-width: 260px;
        padding: 10px 14px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: var(--bg-card);
        color: #fff;
        font-size: 0.9rem;
        outline: none;
      }

      .search-input:focus {
        border-color: var(--netflix-red);
      }

      .btn-search,
      .btn-reset {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        background: var(--netflix-red);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .btn-search:hover,
      .btn-reset:hover {
        background: var(--netflix-red-hover);
      }

      .results-bar {
        margin-bottom: 18px;
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
        gap: 20px;
      }

      .episode-card {
        background: linear-gradient(155deg, #222222 0%, #171717 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-md);
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 170px;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .episode-card:hover {
        transform: translateY(-5px);
        border-color: var(--netflix-red);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.65);
      }

      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ep-code {
        padding: 4px 10px;
        border-radius: 4px;
        background: var(--netflix-red);
        color: #fff;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }

      .ep-id {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }

      .ep-title {
        margin: 14px 0;
        font-size: 1.15rem;
        font-weight: 700;
        line-height: 1.3;
        color: #fff;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.8rem;
      }

      .ep-date {
        color: var(--text-secondary);
      }

      .ep-cast {
        color: #ff8e94;
        font-weight: 700;
      }

      .pagination {
        margin-top: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
      }

      .page-btn {
        padding: 10px 20px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: var(--bg-elevated);
        color: #fff;
        font-weight: 600;
      }

      .page-btn:hover:not(:disabled) {
        background: var(--netflix-red);
        border-color: var(--netflix-red);
      }

      .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .page-indicator {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      .empty-state {
        text-align: center;
        padding: 48px 20px;
        background: var(--bg-card);
        border-radius: var(--radius-md);
      }
    `,
  ],
})
export class EpisodesComponent implements OnInit {
  private readonly rickMortyService = inject(RickMortyService);

  readonly episodes = signal<Episode[]>([]);
  readonly info = signal<ApiInfo | null>(null);
  readonly currentPage = signal(1);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  searchTerm = '';

  ngOnInit(): void {
    this.loadEpisodes(1);
  }

  applyFilters(): void {
    this.loadEpisodes(1);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.loadEpisodes(1);
  }

  goToPage(page: number): void {
    if (page < 1) return;
    this.loadEpisodes(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadEpisodes(page: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.rickMortyService.getEpisodes(page, this.searchTerm).subscribe({
      next: (res) => {
        this.episodes.set(res.results);
        this.info.set(res.info);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.episodes.set([]);
        this.info.set(null);
        this.errorMessage.set('No se encontraron episodios con ese nombre.');
        this.loading.set(false);
      },
    });
  }
}

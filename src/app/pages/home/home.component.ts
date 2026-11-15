import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map, switchMap } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { Episode, EpisodeWithCharacters } from '../../models/rick-morty.model';
import { RickMortyService } from '../../services/rick-morty.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NavbarComponent, CharacterCardComponent],
  template: `
    <app-navbar />

    <main class="home-page">
      <section class="intro-banner">
        <div>
          <h1>Catálogo de Episodios y Personajes</h1>
          <p>
            Explora cada episodio con los personajes que aparecen en él, o navega directamente al
            listado completo.
          </p>
        </div>

        <div class="intro-actions">
          <a routerLink="/characters" class="btn-action">Listado Personajes</a>
          <a routerLink="/episodes" class="btn-action secondary">Listado Episodios</a>
        </div>
      </section>

      @if (loadingInitial()) {
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <span>Cargando episodios y personajes...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="error-box">
          <p>{{ errorMessage() }}</p>
          <button type="button" class="btn-retry" (click)="loadEpisodesPage(1)">
            Reintentar
          </button>
        </div>
      } @else {
        <section class="rows-container">
          @for (row of episodeRows(); track row.episode.id) {
            <article class="episode-row">
              <div class="row-header">
                <div class="row-title-group">
                  <span class="ep-badge">{{ row.episode.episode }}</span>
                  <h2 class="row-title">{{ row.episode.name }}</h2>
                  <span class="ep-meta">
                    {{ row.episode.air_date }} · {{ row.characters.length }} personajes
                  </span>
                </div>

                <a [routerLink]="['/episodes', row.episode.id]" class="row-link">
                  Ver detalle del episodio →
                </a>
              </div>

              <div class="carousel-wrapper">
                <button
                  type="button"
                  class="carousel-btn left"
                  aria-label="Desplazar a la izquierda"
                  (click)="scrollRow(carousel, -1)"
                >
                  ‹
                </button>

                <div #carousel class="carousel-track">
                  @for (char of row.characters; track char.id) {
                    <div class="carousel-item">
                      <app-character-card [character]="char" />
                    </div>
                  }
                </div>

                <button
                  type="button"
                  class="carousel-btn right"
                  aria-label="Desplazar a la derecha"
                  (click)="scrollRow(carousel, 1)"
                >
                  ›
                </button>
              </div>
            </article>
          }
        </section>

        @if (hasMore()) {
          <div class="load-more-wrap">
            <button
              type="button"
              class="btn-load-more"
              [disabled]="loadingMore()"
              (click)="loadMoreEpisodes()"
            >
              {{ loadingMore() ? 'Cargando...' : 'Cargar más episodios' }}
            </button>
          </div>
        }
      }
    </main>
  `,
  styles: [
    `
      .home-page {
        min-height: calc(100vh - 60px);
        padding: 28px 24px 48px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .intro-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        padding: 20px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 32px;
      }

      .intro-banner h1 {
        margin: 0 0 6px;
        font-size: 1.5rem;
      }

      .intro-banner p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.92rem;
      }

      .intro-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn-action {
        padding: 9px 16px;
        border-radius: 4px;
        background: var(--netflix-red);
        color: #fff;
        font-size: 0.88rem;
        font-weight: 600;
      }

      .btn-action:hover {
        background: var(--netflix-red-hover);
      }

      .btn-action.secondary {
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
      }

      .btn-action.secondary:hover {
        background: #383838;
      }

      .rows-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .episode-row {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .row-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .row-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .ep-badge {
        padding: 3px 8px;
        border-radius: 4px;
        background: var(--netflix-red);
        color: #fff;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .row-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
      }

      .ep-meta {
        font-size: 0.84rem;
        color: var(--text-secondary);
      }

      .row-link {
        font-size: 0.86rem;
        color: var(--text-secondary);
      }

      .row-link:hover {
        color: var(--netflix-red);
      }

      .carousel-wrapper {
        position: relative;
      }

      .carousel-track {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        scroll-behavior: smooth;
        padding: 4px 0 8px;
      }

      .carousel-item {
        flex: 0 0 175px;
      }

      .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 4;
        width: 34px;
        height: 54px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: rgba(20, 20, 20, 0.85);
        color: #fff;
        font-size: 1.5rem;
      }

      .carousel-btn:hover {
        background: var(--netflix-red);
      }

      .carousel-btn.left {
        left: 0;
      }

      .carousel-btn.right {
        right: 0;
      }

      .load-more-wrap {
        display: flex;
        justify-content: center;
        margin-top: 32px;
      }

      .btn-load-more,
      .btn-retry {
        padding: 10px 22px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background: var(--bg-elevated);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .btn-load-more:hover:not(:disabled),
      .btn-retry:hover {
        background: var(--netflix-red);
        border-color: var(--netflix-red);
      }

      .error-box {
        text-align: center;
        padding: 32px 16px;
        background: var(--bg-card);
        border-radius: 6px;
      }

      @media (max-width: 720px) {
        .home-page {
          padding: 20px 14px 40px;
        }
        .carousel-item {
          flex: 0 0 150px;
        }
        .carousel-btn {
          display: none;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private readonly rickMortyService = inject(RickMortyService);

  readonly episodeRows = signal<EpisodeWithCharacters[]>([]);
  readonly featuredEpisode = signal<Episode | null>(null);
  readonly loadingInitial = signal(true);
  readonly loadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly hasMore = signal(false);

  private currentPage = 1;

  ngOnInit(): void {
    this.loadEpisodesPage(1);
  }

  loadEpisodesPage(page: number): void {
    if (page === 1) {
      this.loadingInitial.set(true);
      this.errorMessage.set('');
    } else {
      this.loadingMore.set(true);
    }

    this.rickMortyService
      .getEpisodes(page)
      .pipe(
        switchMap((response) => {
          this.hasMore.set(Boolean(response.info.next));
          this.currentPage = page;

          if (page === 1 && response.results.length > 0) {
            this.featuredEpisode.set(response.results[0]);
          }

          const rowRequests = response.results.map((episode) => {
            const charIds = episode.characters.map((url) =>
              this.rickMortyService.extractIdFromUrl(url)
            );
            return this.rickMortyService
              .getCharactersByIds(charIds)
              .pipe(map((characters) => ({ episode, characters })));
          });

          return forkJoin(rowRequests);
        })
      )
      .subscribe({
        next: (rows) => {
          if (page === 1) {
            this.episodeRows.set(rows);
            this.loadingInitial.set(false);
          } else {
            this.episodeRows.update((prev) => [...prev, ...rows]);
            this.loadingMore.set(false);
          }
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar el catálogo desde Rick and Morty API.');
          this.loadingInitial.set(false);
          this.loadingMore.set(false);
        },
      });
  }

  loadMoreEpisodes(): void {
    if (this.hasMore() && !this.loadingMore()) {
      this.loadEpisodesPage(this.currentPage + 1);
    }
  }

  scrollRow(container: HTMLElement, direction: number): void {
    const distance = Math.max(300, container.clientWidth * 0.75);
    container.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }
}

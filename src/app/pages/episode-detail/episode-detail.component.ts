import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { Character, Episode } from '../../models/rick-morty.model';
import { RickMortyService } from '../../services/rick-morty.service';

@Component({
  selector: 'app-episode-detail',
  standalone: true,
  imports: [RouterLink, NavbarComponent, CharacterCardComponent],
  template: `
    <app-navbar />

    <main class="detail-page">
      <div class="top-nav">
        <a routerLink="/episodes" class="back-link">← Volver al listado de episodios</a>
      </div>

      @if (loading()) {
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <span>Cargando detalle del episodio...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="error-box">
          <h2>Episodio no encontrado</h2>
          <p>{{ errorMessage() }}</p>
          <a routerLink="/episodes" class="btn-back">Ir al catálogo de episodios</a>
        </div>
      } @else if (episode(); as ep) {
        <section class="episode-banner">
          <div class="banner-meta">
            <span class="ep-badge">{{ ep.episode }}</span>
            <span class="ep-id">Episodio #{{ ep.id }}</span>
          </div>

          <h1>{{ ep.name }}</h1>

          <div class="banner-stats">
            <div class="stat">
              <span class="stat-label">Fecha de emisión</span>
              <span class="stat-value">{{ ep.air_date }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Personajes en el capítulo</span>
              <span class="stat-value">{{ characters().length }}</span>
            </div>
          </div>
        </section>

        <section class="cast-section">
          <h2>Personajes de este episodio</h2>
          <p class="section-sub">
            Haz clic en cualquier personaje para ver su perfil completo.
          </p>

          <div class="cast-grid">
            @for (char of characters(); track char.id) {
              <app-character-card [character]="char" />
            }
          </div>
        </section>
      }
    </main>
  `,
  styles: [
    `
      .detail-page {
        min-height: calc(100vh - 60px);
        padding: 28px 24px 48px;
        max-width: 1300px;
        margin: 0 auto;
      }

      .top-nav {
        margin-bottom: 24px;
      }

      .back-link {
        color: var(--text-secondary);
        font-size: 0.92rem;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .back-link:hover {
        color: #fff;
      }

      .episode-banner {
        background: linear-gradient(135deg, #242424 0%, #171717 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-lg);
        padding: 32px;
        box-shadow: var(--shadow-card);
      }

      .banner-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .ep-badge {
        padding: 5px 12px;
        border-radius: 4px;
        background: var(--netflix-red);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.06em;
      }

      .ep-id {
        color: var(--text-muted);
        font-size: 0.86rem;
        font-weight: 600;
      }

      h1 {
        margin: 0 0 24px;
        font-size: clamp(1.9rem, 4vw, 3rem);
        font-weight: 800;
      }

      .banner-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .stat {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: var(--radius-md);
        padding: 12px 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        font-weight: 700;
      }

      .stat-value {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
      }

      .cast-section {
        margin-top: 40px;
      }

      .cast-section h2 {
        margin: 0 0 6px;
        font-size: 1.45rem;
        font-weight: 800;
      }

      .section-sub {
        margin: 0 0 22px;
        color: var(--text-secondary);
        font-size: 0.92rem;
      }

      .cast-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
        gap: 18px;
      }

      .error-box {
        text-align: center;
        padding: 48px 20px;
        background: var(--bg-card);
        border-radius: var(--radius-md);
      }

      .btn-back {
        display: inline-block;
        margin-top: 14px;
        padding: 10px 20px;
        border-radius: 6px;
        background: var(--netflix-red);
        color: #fff;
        font-weight: 700;
      }
    `,
  ],
})
export class EpisodeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rickMortyService = inject(RickMortyService);

  readonly episode = signal<Episode | null>(null);
  readonly characters = signal<Character[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.errorMessage.set('');
          const id = Number(params.get('id'));
          return this.rickMortyService.getEpisodeById(id);
        }),
        switchMap((ep) => {
          this.episode.set(ep);
          const charIds = ep.characters.map((url) =>
            this.rickMortyService.extractIdFromUrl(url)
          );
          return this.rickMortyService.getCharactersByIds(charIds);
        })
      )
      .subscribe({
        next: (chars) => {
          this.characters.set(chars);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudo obtener el detalle de este episodio.');
          this.loading.set(false);
        },
      });
  }
}

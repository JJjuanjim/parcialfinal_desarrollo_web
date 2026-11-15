import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Character, Episode } from '../../models/rick-morty.model';
import { RickMortyService } from '../../services/rick-morty.service';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    <main class="detail-page">
      <div class="top-nav">
        <a routerLink="/characters" class="back-link">← Volver al listado de personajes</a>
      </div>

      @if (loading()) {
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <span>Cargando detalle del personaje...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="error-box">
          <h2>Personaje no encontrado</h2>
          <p>{{ errorMessage() }}</p>
          <a routerLink="/characters" class="btn-back">Ir al catálogo de personajes</a>
        </div>
      } @else if (character(); as char) {
        <section class="hero-card">
          <div class="poster">
            <img [src]="char.image" [alt]="char.name" />
          </div>

          <div class="info">
            <div class="badges">
              <span class="id-pill">ID #{{ char.id }}</span>
              <span class="status-badge">
                <span
                  class="status-dot"
                  [class.status-alive]="char.status === 'Alive'"
                  [class.status-dead]="char.status === 'Dead'"
                  [class.status-unknown]="char.status === 'unknown'"
                ></span>
                {{ translateStatus(char.status) }}
              </span>
            </div>

            <h1>{{ char.name }}</h1>

            <div class="facts-grid">
              <div class="fact">
                <span class="fact-label">Especie</span>
                <span class="fact-value">{{ char.species }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">Género</span>
                <span class="fact-value">{{ char.gender }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">Tipo</span>
                <span class="fact-value">{{ char.type || 'Estándar' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">Origen</span>
                <span class="fact-value">{{ char.origin.name }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">Última ubicación</span>
                <span class="fact-value">{{ char.location.name }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">Apariciones</span>
                <span class="fact-value">{{ episodes().length }} episodios</span>
              </div>
            </div>
          </div>
        </section>

        <section class="episodes-section">
          <h2>Episodios en los que aparece</h2>
          <p class="section-sub">Haz clic en un episodio para abrir su detalle y elenco.</p>

          <div class="episodes-grid">
            @for (ep of episodes(); track ep.id) {
              <a [routerLink]="['/episodes', ep.id]" class="episode-tile">
                <span class="ep-code">{{ ep.episode }}</span>
                <h3>{{ ep.name }}</h3>
                <span class="ep-date">{{ ep.air_date }}</span>
              </a>
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
        max-width: 1200px;
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

      .hero-card {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 36px;
        background: rgba(28, 28, 28, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-lg);
        padding: 28px;
        box-shadow: var(--shadow-card);
      }

      .poster img {
        width: 100%;
        border-radius: var(--radius-md);
        display: block;
        object-fit: cover;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.65);
      }

      .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .badges {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .id-pill {
        padding: 4px 10px;
        border-radius: 4px;
        background: var(--netflix-red);
        font-size: 0.76rem;
        font-weight: 800;
      }

      h1 {
        margin: 0 0 24px;
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 800;
      }

      .facts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }

      .fact {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .fact-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        font-weight: 700;
      }

      .fact-value {
        font-size: 0.96rem;
        font-weight: 600;
        color: #fff;
      }

      .episodes-section {
        margin-top: 44px;
      }

      .episodes-section h2 {
        margin: 0 0 6px;
        font-size: 1.4rem;
        font-weight: 800;
      }

      .section-sub {
        margin: 0 0 20px;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 14px;
      }

      .episode-tile {
        background: var(--bg-card);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: var(--radius-md);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .episode-tile:hover {
        transform: translateY(-3px);
        border-color: var(--netflix-red);
      }

      .ep-code {
        align-self: flex-start;
        padding: 3px 8px;
        border-radius: 4px;
        background: rgba(229, 9, 20, 0.2);
        color: #ff8e94;
        font-size: 0.74rem;
        font-weight: 800;
      }

      .episode-tile h3 {
        margin: 4px 0 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: #fff;
      }

      .ep-date {
        font-size: 0.8rem;
        color: var(--text-muted);
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

      @media (max-width: 820px) {
        .hero-card {
          grid-template-columns: 1fr;
        }
        .poster {
          max-width: 300px;
        }
      }
    `,
  ],
})
export class CharacterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rickMortyService = inject(RickMortyService);

  readonly character = signal<Character | null>(null);
  readonly episodes = signal<Episode[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.errorMessage.set('');
          const id = Number(params.get('id'));
          return this.rickMortyService.getCharacterById(id);
        }),
        switchMap((char) => {
          this.character.set(char);
          const epIds = char.episode.map((url) =>
            this.rickMortyService.extractIdFromUrl(url)
          );
          return this.rickMortyService.getEpisodesByIds(epIds);
        })
      )
      .subscribe({
        next: (eps) => {
          this.episodes.set(eps);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudo obtener la información de este personaje.');
          this.loading.set(false);
        },
      });
  }

  translateStatus(status: Character['status']): string {
    if (status === 'Alive') return 'Vivo';
    if (status === 'Dead') return 'Muerto';
    return 'Desconocido';
  }
}

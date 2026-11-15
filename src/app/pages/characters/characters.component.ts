import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { ApiInfo, Character } from '../../models/rick-morty.model';
import { RickMortyService } from '../../services/rick-morty.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [FormsModule, NavbarComponent, CharacterCardComponent],
  template: `
    <app-navbar />

    <main class="catalog-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">CATÁLOGO DE PERSONAJES</span>
          <h1>Listado de Personajes</h1>
          <p>Haz clic en cualquier personaje para ver su ficha detallada.</p>
        </div>

        <form class="filters" (ngSubmit)="applyFilters()">
          <input
            type="text"
            name="search"
            [(ngModel)]="searchTerm"
            placeholder="Buscar por nombre (ej. Rick, Morty)..."
            class="search-input"
          />

          <select name="status" [(ngModel)]="statusFilter" (change)="applyFilters()" class="select-input">
            <option value="">Todos los estados</option>
            <option value="alive">Vivo</option>
            <option value="dead">Muerto</option>
            <option value="unknown">Desconocido</option>
          </select>

          <button type="submit" class="btn-search">Buscar</button>
        </form>
      </header>

      @if (loading()) {
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <span>Cargando catálogo de personajes...</span>
        </div>
      } @else if (errorMessage()) {
        <div class="empty-state">
          <p>{{ errorMessage() }}</p>
          <button type="button" class="btn-reset" (click)="resetFilters()">
            Limpiar filtros
          </button>
        </div>
      } @else {
        @if (info(); as meta) {
          <div class="results-bar">
            <span>{{ meta.count }} personajes encontrados · Página {{ currentPage() }} de {{ meta.pages }}</span>
          </div>
        }

        <section class="grid">
          @for (character of characters(); track character.id) {
            <app-character-card [character]="character" />
          }
        </section>

        @if (info(); as meta) {
          <nav class="pagination" aria-label="Paginación de personajes">
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

      .search-input,
      .select-input {
        padding: 10px 14px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: var(--bg-card);
        color: #fff;
        font-size: 0.9rem;
        outline: none;
      }

      .search-input {
        min-width: 240px;
      }

      .search-input:focus,
      .select-input:focus {
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

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 20px;
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
export class CharactersComponent implements OnInit {
  private readonly rickMortyService = inject(RickMortyService);

  readonly characters = signal<Character[]>([]);
  readonly info = signal<ApiInfo | null>(null);
  readonly currentPage = signal(1);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  searchTerm = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadCharacters(1);
  }

  applyFilters(): void {
    this.loadCharacters(1);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.loadCharacters(1);
  }

  goToPage(page: number): void {
    if (page < 1) return;
    this.loadCharacters(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadCharacters(page: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.rickMortyService
      .getCharacters(page, this.searchTerm, this.statusFilter)
      .subscribe({
        next: (res) => {
          this.characters.set(res.results);
          this.info.set(res.info);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.characters.set([]);
          this.info.set(null);
          this.errorMessage.set('No se encontraron personajes con los criterios indicados.');
          this.loading.set(false);
        },
      });
  }
}

import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Character } from '../../models/rick-morty.model';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/characters', character().id]" class="card">
      <img [src]="character().image" [alt]="character().name" loading="lazy" />
      <div class="card-info">
        <h3 class="card-title" [title]="character().name">{{ character().name }}</h3>
        <p class="card-meta">{{ character().species }} · {{ translateStatus(character().status) }}</p>
      </div>
    </a>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        overflow: hidden;
        height: 100%;
        transition: border-color 0.2s ease, transform 0.2s ease;
      }

      .card:hover {
        border-color: var(--netflix-red);
        transform: translateY(-2px);
      }

      .card img {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        display: block;
      }

      .card-info {
        padding: 10px 12px;
      }

      .card-title {
        margin: 0 0 4px;
        font-size: 0.92rem;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-meta {
        margin: 0;
        font-size: 0.78rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class CharacterCardComponent {
  readonly character = input.required<Character>();

  translateStatus(status: Character['status']): string {
    if (status === 'Alive') return 'Vivo';
    if (status === 'Dead') return 'Muerto';
    return 'Desconocido';
  }
}

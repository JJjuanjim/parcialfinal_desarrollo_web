import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { ApiResponse, Character, Episode } from '../models/rick-morty.model';

@Injectable({
  providedIn: 'root',
})
export class RickMortyService {
  private readonly baseUrl = 'https://rickandmortyapi.com/api';
  private readonly characterCache = new Map<number, Character>();
  private readonly episodeCache = new Map<number, Episode>();

  constructor(private readonly http: HttpClient) {}

  /**
   * LISTADO Personajes: https://rickandmortyapi.com/api/character
   */
  getCharacters(page = 1, name = '', status = ''): Observable<ApiResponse<Character>> {
    let params = new HttpParams().set('page', page);
    if (name.trim()) {
      params = params.set('name', name.trim());
    }
    if (status.trim()) {
      params = params.set('status', status.trim());
    }

    return this.http
      .get<ApiResponse<Character>>(`${this.baseUrl}/character`, { params })
      .pipe(
        tap((res) => {
          res.results.forEach((char) => this.characterCache.set(char.id, char));
        })
      );
  }

  /**
   * DETALLE Personaje: https://rickandmortyapi.com/api/character/{id}
   */
  getCharacterById(id: number): Observable<Character> {
    const cached = this.characterCache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.http
      .get<Character>(`${this.baseUrl}/character/${id}`)
      .pipe(tap((char) => this.characterCache.set(char.id, char)));
  }

  /**
   * Obtiene múltiples personajes por lista de IDs en una sola petición REST
   * usando caché para evitar llamadas duplicadas.
   */
  getCharactersByIds(ids: number[]): Observable<Character[]> {
    const uniqueIds = Array.from(new Set(ids)).filter((id) => !Number.isNaN(id));
    if (uniqueIds.length === 0) {
      return of([]);
    }

    const missingIds = uniqueIds.filter((id) => !this.characterCache.has(id));
    if (missingIds.length === 0) {
      return of(
        uniqueIds
          .map((id) => this.characterCache.get(id)!)
          .filter(Boolean)
      );
    }

    const endpoint =
      missingIds.length === 1
        ? `${this.baseUrl}/character/${missingIds[0]}`
        : `${this.baseUrl}/character/${missingIds.join(',')}`;

    return this.http.get<Character | Character[]>(endpoint).pipe(
      map((response) => (Array.isArray(response) ? response : [response])),
      tap((fetched) => {
        fetched.forEach((char) => this.characterCache.set(char.id, char));
      }),
      map(() =>
        uniqueIds
          .map((id) => this.characterCache.get(id)!)
          .filter(Boolean)
      )
    );
  }

  /**
   * LISTADO Episodios: https://rickandmortyapi.com/api/episode
   */
  getEpisodes(page = 1, name = ''): Observable<ApiResponse<Episode>> {
    let params = new HttpParams().set('page', page);
    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http
      .get<ApiResponse<Episode>>(`${this.baseUrl}/episode`, { params })
      .pipe(
        tap((res) => {
          res.results.forEach((ep) => this.episodeCache.set(ep.id, ep));
        })
      );
  }

  /**
   * DETALLE Episodio: https://rickandmortyapi.com/api/episode/{id}
   */
  getEpisodeById(id: number): Observable<Episode> {
    const cached = this.episodeCache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.http
      .get<Episode>(`${this.baseUrl}/episode/${id}`)
      .pipe(tap((ep) => this.episodeCache.set(ep.id, ep)));
  }

  /**
   * Obtiene múltiples episodios por lista de IDs.
   */
  getEpisodesByIds(ids: number[]): Observable<Episode[]> {
    const uniqueIds = Array.from(new Set(ids)).filter((id) => !Number.isNaN(id));
    if (uniqueIds.length === 0) {
      return of([]);
    }

    const missingIds = uniqueIds.filter((id) => !this.episodeCache.has(id));
    if (missingIds.length === 0) {
      return of(uniqueIds.map((id) => this.episodeCache.get(id)!).filter(Boolean));
    }

    const endpoint =
      missingIds.length === 1
        ? `${this.baseUrl}/episode/${missingIds[0]}`
        : `${this.baseUrl}/episode/${missingIds.join(',')}`;

    return this.http.get<Episode | Episode[]>(endpoint).pipe(
      map((response) => (Array.isArray(response) ? response : [response])),
      tap((fetched) => {
        fetched.forEach((ep) => this.episodeCache.set(ep.id, ep));
      }),
      map(() => uniqueIds.map((id) => this.episodeCache.get(id)!).filter(Boolean))
    );
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}

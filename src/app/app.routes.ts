import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { EpisodesComponent } from './pages/episodes/episodes.component';
import { EpisodeDetailComponent } from './pages/episode-detail/episode-detail.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'characters', component: CharactersComponent, canActivate: [authGuard] },
  { path: 'characters/:id', component: CharacterDetailComponent, canActivate: [authGuard] },
  { path: 'episodes', component: EpisodesComponent, canActivate: [authGuard] },
  { path: 'episodes/:id', component: EpisodeDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];

// Déclaration des routes publiques et protégées de l'application.
import { Routes } from '@angular/router';
import { accueilGuard, authGuard, roleGuard } from './guards/acces.guards';
import { AccesRefuseComponent } from './pages/acces-refuse/acces-refuse.component';
import { CataloguePageComponent } from './pages/catalogue/catalogue-page.component';
import { DetailMaterielPageComponent } from './pages/detail-materiel/detail-materiel-page.component';
import { IntrouvableComponent } from './pages/introuvable/introuvable.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { MesReservationsPageComponent } from './pages/mes-reservations/mes-reservations-page.component';

const TITRE = 'Campus Matériel';

export const routes: Routes = [
  // « / » n'affiche rien : le guard redirige vers /login ou /catalogue selon la session.
  { path: '', pathMatch: 'full', canActivate: [accueilGuard], children: [] },

  // Pages publiques
  { path: 'login', component: LoginPageComponent, title: `Connexion — ${TITRE}` },
  { path: 'acces-refuse', component: AccesRefuseComponent, title: `Accès refusé — ${TITRE}` },

  // Pages pour tout utilisateur connecté
  {
    path: 'catalogue',
    component: CataloguePageComponent,
    canActivate: [authGuard],
    title: `Catalogue — ${TITRE}`
  },
  {
    path: 'materiels/:id',
    component: DetailMaterielPageComponent,
    canActivate: [authGuard],
    title: `Fiche matériel — ${TITRE}`
  },

  // Page réservée aux étudiants
  {
    path: 'mes-reservations',
    component: MesReservationsPageComponent,
    canActivate: [roleGuard('student')],
    title: `Mes réservations — ${TITRE}`
  },

  // Espace réservé au responsable, chargé à la demande (lazy loading) :
  // son code n'est téléchargé que si l'utilisateur y accède réellement.
  {
    path: 'gestion',
    canActivate: [roleGuard('manager')],
    loadChildren: () => import('./pages/gestion/gestion.routes').then((m) => m.GESTION_ROUTES)
  },

  // Toute autre URL : page 404
  { path: '**', component: IntrouvableComponent, title: `Page introuvable — ${TITRE}` }
];

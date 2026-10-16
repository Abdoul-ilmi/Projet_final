// Routes lazy-loadées de l'espace de gestion du catalogue.
import { Routes } from '@angular/router';
import { GestionFormulairePageComponent } from './gestion-formulaire-page.component';
import { GestionListePageComponent } from './gestion-liste-page.component';

const TITRE = 'Campus Matériel';

/**
 * Routes enfants de /gestion. Ce fichier est chargé à la demande (loadChildren) :
 * Angular en fait un « chunk » séparé, téléchargé uniquement à la première visite de l'espace.
 * L'accès reste protégé par roleGuard('manager') défini sur la route parente.
 */
export const GESTION_ROUTES: Routes = [
  { path: '', component: GestionListePageComponent, title: `Gestion du catalogue — ${TITRE}` },
  { path: 'nouveau', component: GestionFormulairePageComponent, title: `Nouvel équipement — ${TITRE}` },
  {
    path: ':id/modifier',
    component: GestionFormulairePageComponent,
    title: `Modifier un équipement — ${TITRE}`
  }
];

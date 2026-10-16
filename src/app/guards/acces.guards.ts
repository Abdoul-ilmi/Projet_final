// Guards de navigation : session active et rôle autorisé.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../data/donnees-initiales';
import { SessionService } from '../services/session.service';

/**
 * Route « / » : redirige selon la session (catalogue si connecté, connexion sinon).
 */
export const accueilGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return router.createUrlTree([session.estConnecte() ? '/catalogue' : '/login']);
};

/**
 * Protège une page privée : un visiteur non connecté est renvoyé vers la connexion.
 * Le contrôle s'exécute aussi pour une URL saisie directement dans la barre d'adresse.
 */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.estConnecte() ? true : router.createUrlTree(['/login']);
};

/**
 * Protège une page réservée à un rôle précis.
 *  - non connecté        → connexion
 *  - mauvais rôle        → page « accès refusé » (avec le rôle requis en paramètre)
 */
export function roleGuard(roleRequis: Role): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);
    const utilisateur = session.utilisateur();

    if (!utilisateur) {
      return router.createUrlTree(['/login']);
    }
    if (utilisateur.role !== roleRequis) {
      return router.createUrlTree(['/acces-refuse'], { queryParams: { requis: roleRequis } });
    }
    return true;
  };
}

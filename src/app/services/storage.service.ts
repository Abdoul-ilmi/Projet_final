// Accès sécurisé et centralisé au stockage local du navigateur.
import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * Accès centralisé à localStorage.
 *
 * Toutes les lectures/écritures passent ici afin de :
 *  - gérer les erreurs au même endroit (stockage désactivé, quota dépassé, JSON corrompu) ;
 *  - prévenir l'utilisateur avec un message clair au lieu de planter.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly notifications = inject(NotificationService);

  /**
   * Lit et décode une valeur JSON.
   * Renvoie null si la clé n'existe pas OU si la lecture a échoué (un message est alors affiché).
   * Attention : un tableau vide enregistré ([]) est une donnée valide, différente de null.
   */
  lire(cle: string): unknown {
    try {
      const brut = localStorage.getItem(cle);
      return brut === null ? null : JSON.parse(brut);
    } catch {
      this.notifications.erreur(
        'Lecture des données locales impossible : le stockage est indisponible ou son contenu est corrompu. ' +
          'Les données de démonstration sont utilisées à la place.'
      );
      return null;
    }
  }

  /** Enregistre une valeur. Renvoie false (et prévient l'utilisateur) si l'écriture échoue. */
  ecrire(cle: string, valeur: unknown): boolean {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch {
      this.notifications.erreur(
        "Enregistrement impossible : le stockage local est plein ou désactivé. La modification n'a pas été conservée."
      );
      return false;
    }
  }

  supprimer(cle: string): void {
    try {
      localStorage.removeItem(cle);
    } catch {
      this.notifications.erreur('Suppression des données de session impossible dans le stockage local.');
    }
  }
}

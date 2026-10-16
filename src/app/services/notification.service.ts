// Service d'affichage des messages de succès, d'erreur et d'information.
import { Injectable, signal } from '@angular/core';
import { Resultat } from '../models/resultat';

export type TypeNotification = 'succes' | 'erreur' | 'info';

export interface Notification {
  type: TypeNotification;
  texte: string;
}

/**
 * Gère le message affiché en haut de page (confirmation, erreur, information).
 * Un seul message est visible à la fois : le plus récent remplace le précédent.
 * Les erreurs restent affichées jusqu'à fermeture ; les autres disparaissent seules.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _courante = signal<Notification | null>(null);
  /** Message actuellement affiché (lecture seule pour les composants). */
  readonly courante = this._courante.asReadonly();

  private minuteur: ReturnType<typeof setTimeout> | undefined;

  afficher(type: TypeNotification, texte: string): void {
    clearTimeout(this.minuteur);
    this._courante.set({ type, texte });
    if (type !== 'erreur') {
      this.minuteur = setTimeout(() => this.fermer(), 6000);
    }
  }

  succes(texte: string): void {
    this.afficher('succes', texte);
  }

  erreur(texte: string): void {
    this.afficher('erreur', texte);
  }

  info(texte: string): void {
    this.afficher('info', texte);
  }

  /** Affiche directement le résultat d'une opération métier (succès ou erreur). */
  depuis(resultat: Resultat): void {
    this.afficher(resultat.ok ? 'succes' : 'erreur', resultat.message);
  }

  fermer(): void {
    clearTimeout(this.minuteur);
    this._courante.set(null);
  }
}

// Service de session simulée et de restauration du compte connecté.
import { Injectable, computed, inject, signal } from '@angular/core';
import { COMPTES_INITIAUX, Compte } from '../data/donnees-initiales';
import { StorageService } from './storage.service';

const CLE_SESSION = 'campus.session';

/**
 * Session simulée : l'utilisateur choisit un compte de démonstration (pas de mot de passe).
 *
 * Seul l'identifiant du compte est stocké. Au rechargement, le compte complet (avec son rôle)
 * est retrouvé dans la liste officielle : modifier le rôle dans localStorage n'a donc aucun effet.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storage = inject(StorageService);

  readonly comptes: readonly Compte[] = structuredClone(COMPTES_INITIAUX);

  private readonly _utilisateur = signal<Compte | null>(this.restaurer());
  /** Compte connecté, ou null si personne n'est connecté. */
  readonly utilisateur = this._utilisateur.asReadonly();

  readonly estConnecte = computed(() => this._utilisateur() !== null);
  readonly estEtudiant = computed(() => this._utilisateur()?.role === 'student');
  readonly estResponsable = computed(() => this._utilisateur()?.role === 'manager');

  /** Ouvre la session du compte demandé. Renvoie null si l'identifiant est inconnu. */
  connecter(idCompte: number): Compte | null {
    const compte = this.comptes.find((c) => c.id === idCompte) ?? null;
    if (compte) {
      this.storage.ecrire(CLE_SESSION, compte.id);
      this._utilisateur.set(compte);
    }
    return compte;
  }

  /** Ferme la session et supprime sa trace du stockage local. */
  deconnecter(): void {
    this.storage.supprimer(CLE_SESSION);
    this._utilisateur.set(null);
  }

  /** Retrouve la session enregistrée au démarrage de l'application. */
  private restaurer(): Compte | null {
    const idEnregistre = this.storage.lire(CLE_SESSION);
    return this.comptes.find((c) => c.id === idEnregistre) ?? null;
  }
}

// Service métier du catalogue et de sa persistance locale.
import { Injectable, inject, signal } from '@angular/core';
import {
  CATEGORIES,
  Categorie,
  EQUIPEMENTS_INITIAUX,
  Equipement
} from '../data/donnees-initiales';
import { Resultat } from '../models/resultat';
import { estEquipement } from '../utils/type-guards';
import { NotificationService } from './notification.service';
import { ReservationService } from './reservation.service';
import { StorageService } from './storage.service';

const CLE_EQUIPEMENTS = 'campus.equipements';

/** Données saisies dans le formulaire (tout sauf l'identifiant, attribué par le service). */
export type DonneesEquipement = Omit<Equipement, 'id'>;

/**
 * Source de vérité du catalogue de matériel (liste + création, modification, suppression).
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly storage = inject(StorageService);
  private readonly reservations = inject(ReservationService);
  private readonly notifications = inject(NotificationService);

  readonly categories: readonly Categorie[] = CATEGORIES;

  private readonly _equipements = signal<Equipement[]>(this.charger());
  readonly equipements = this._equipements.asReadonly();

  trouver(id: number): Equipement | undefined {
    return this._equipements().find((e) => e.id === id);
  }

  /** Crée une fiche avec un nouvel identifiant unique et renvoie l'équipement créé. */
  creer(donnees: DonneesEquipement): Equipement | null {
    const nouveau: Equipement = { id: this.prochainIdentifiant(), ...this.nettoyer(donnees) };
    return this.appliquer([...this._equipements(), nouveau]) ? nouveau : null;
  }

  modifier(id: number, donnees: DonneesEquipement): Resultat {
    const existant = this.trouver(id);
    if (!existant) {
      return { ok: false, message: 'Modification impossible : cet équipement n\'existe pas.' };
    }
    const modifie: Equipement = { id, ...this.nettoyer(donnees) };
    const liste = this._equipements().map((e) => (e.id === id ? modifie : e));
    if (!this.appliquer(liste)) {
      return { ok: false, message: 'Modification annulée : elle n\'a pas pu être enregistrée.' };
    }
    return { ok: true, message: `La fiche « ${modifie.nom} » a été mise à jour.` };
  }

  /** Supprime un équipement, sauf s'il est réservé (règle métier). */
  supprimer(id: number): Resultat {
    const equipement = this.trouver(id);
    if (!equipement) {
      return { ok: false, message: 'Suppression impossible : cet équipement n\'existe pas.' };
    }
    if (this.reservations.estReserve(id)) {
      return {
        ok: false,
        message:
          `Suppression refusée : « ${equipement.nom} » est actuellement réservé. ` +
          'Il pourra être supprimé une fois la réservation annulée.'
      };
    }
    if (!this.appliquer(this._equipements().filter((e) => e.id !== id))) {
      return { ok: false, message: 'Suppression annulée : elle n\'a pas pu être enregistrée.' };
    }
    return { ok: true, message: `« ${equipement.nom} » a été supprimé du catalogue.` };
  }

  /**
   * Identifiant unique : plus grand identifiant existant + 1
   * (jamais la longueur du tableau, qui produirait des doublons après une suppression).
   */
  private prochainIdentifiant(): number {
    return Math.max(100, ...this._equipements().map((e) => e.id)) + 1;
  }

  /** Retire les espaces superflus saisis autour des textes. */
  private nettoyer(donnees: DonneesEquipement): DonneesEquipement {
    return {
      nom: donnees.nom.trim(),
      categorie: donnees.categorie,
      description: donnees.description.trim(),
      localisation: donnees.localisation.trim()
    };
  }

  /** Enregistre puis met à jour l'état (voir ReservationService.appliquer). */
  private appliquer(nouvelleListe: Equipement[]): boolean {
    if (!this.storage.ecrire(CLE_EQUIPEMENTS, nouvelleListe)) {
      return false;
    }
    this._equipements.set(nouvelleListe);
    return true;
  }

  private charger(): Equipement[] {
    const enregistres = this.storage.lire(CLE_EQUIPEMENTS);

    if (enregistres === null) {
      const initiaux = structuredClone(EQUIPEMENTS_INITIAUX);
      this.storage.ecrire(CLE_EQUIPEMENTS, initiaux);
      return initiaux;
    }
    if (!Array.isArray(enregistres) || !enregistres.every(estEquipement)) {
      this.notifications.erreur(
        'Le catalogue enregistré est illisible : les données de démonstration ont été rechargées.'
      );
      return structuredClone(EQUIPEMENTS_INITIAUX);
    }
    return enregistres;
  }
}

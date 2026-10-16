// Service métier des réservations et de leur persistance locale.
import { Injectable, computed, inject, signal } from '@angular/core';
import { Equipement, RESERVATIONS_INITIALES, Reservation } from '../data/donnees-initiales';
import { Resultat } from '../models/resultat';
import { genererIdentifiant } from '../utils/identifiants';
import { estReservation } from '../utils/type-guards';
import { NotificationService } from './notification.service';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

const CLE_RESERVATIONS = 'campus.reservations';

/**
 * Source de vérité des réservations actives.
 *
 * Règles métier appliquées ICI (et pas dans les composants) :
 *  - seul un étudiant connecté peut réserver ;
 *  - un équipement n'a qu'une seule réservation active ;
 *  - un étudiant n'annule que ses propres réservations.
 *
 * La disponibilité d'un équipement n'est jamais stockée : elle se déduit de cette liste.
 */
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly storage = inject(StorageService);
  private readonly session = inject(SessionService);
  private readonly notifications = inject(NotificationService);

  private readonly _reservations = signal<Reservation[]>(this.charger());
  readonly reservations = this._reservations.asReadonly();

  /** Ensemble des identifiants d'équipements actuellement réservés (recalculé automatiquement). */
  private readonly idsReserves = computed(
    () => new Set(this._reservations().map((r) => r.equipementId))
  );

  /** Réservations de l'étudiant connecté uniquement. */
  readonly mesReservations = computed(() => {
    const utilisateur = this.session.utilisateur();
    return utilisateur ? this._reservations().filter((r) => r.etudiantId === utilisateur.id) : [];
  });

  /** Un équipement est réservé s'il existe une réservation active à son identifiant. */
  estReserve(equipementId: number): boolean {
    return this.idsReserves().has(equipementId);
  }

  reservationPour(equipementId: number): Reservation | undefined {
    return this._reservations().find((r) => r.equipementId === equipementId);
  }

  /**
   * Réserve un équipement pour l'étudiant connecté.
   * Étapes : contrôle du profil → contrôle de disponibilité → création → sauvegarde → mise à jour de l'état.
   */
  reserver(equipement: Equipement): Resultat {
    const utilisateur = this.session.utilisateur();
    if (!utilisateur || utilisateur.role !== 'student') {
      return { ok: false, message: 'Seuls les étudiants connectés peuvent réserver du matériel.' };
    }
    if (this.estReserve(equipement.id)) {
      return {
        ok: false,
        message: `« ${equipement.nom} » est déjà réservé : il n'est pas possible de le réserver une seconde fois.`
      };
    }

    const nouvelle: Reservation = {
      id: genererIdentifiant(),
      equipementId: equipement.id,
      etudiantId: utilisateur.id
    };
    if (!this.appliquer([...this._reservations(), nouvelle])) {
      return { ok: false, message: 'Réservation annulée : elle n\'a pas pu être enregistrée.' };
    }
    return { ok: true, message: `« ${equipement.nom} » est réservé à votre nom.` };
  }

  /** Annule une réservation de l'étudiant connecté : l'équipement redevient disponible aussitôt. */
  annuler(reservationId: string): Resultat {
    const utilisateur = this.session.utilisateur();
    const reservation = this._reservations().find((r) => r.id === reservationId);

    if (!reservation) {
      return { ok: false, message: 'Cette réservation n\'existe plus.' };
    }
    if (!utilisateur || reservation.etudiantId !== utilisateur.id) {
      return { ok: false, message: 'Vous ne pouvez annuler que vos propres réservations.' };
    }
    if (!this.appliquer(this._reservations().filter((r) => r.id !== reservationId))) {
      return { ok: false, message: 'Annulation impossible : la modification n\'a pas pu être enregistrée.' };
    }
    return { ok: true, message: 'Réservation annulée : le matériel est de nouveau disponible.' };
  }

  /**
   * Enregistre d'abord, met à jour l'état ensuite : si la sauvegarde échoue,
   * l'écran reste cohérent avec le stockage (aucune réservation « fantôme »).
   */
  private appliquer(nouvelleListe: Reservation[]): boolean {
    if (!this.storage.ecrire(CLE_RESERVATIONS, nouvelleListe)) {
      return false;
    }
    this._reservations.set(nouvelleListe);
    return true;
  }

  /** Chargement au démarrage : stockage si présent, sinon jeu initial (copié avec structuredClone). */
  private charger(): Reservation[] {
    const enregistrees = this.storage.lire(CLE_RESERVATIONS);

    // Clé absente → premier lancement. Un tableau vide enregistré, lui, est une donnée valide.
    if (enregistrees === null) {
      const initiales = structuredClone(RESERVATIONS_INITIALES);
      this.storage.ecrire(CLE_RESERVATIONS, initiales);
      return initiales;
    }
    if (!Array.isArray(enregistrees) || !enregistrees.every(estReservation)) {
      this.notifications.erreur(
        'Les réservations enregistrées sont illisibles : elles ont été réinitialisées.'
      );
      return structuredClone(RESERVATIONS_INITIALES);
    }
    return enregistrees;
  }
}

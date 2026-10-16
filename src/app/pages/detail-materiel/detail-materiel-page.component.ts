// Page détaillée d'un équipement et de son état de réservation.
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeDisponibiliteComponent } from '../../components/badge-disponibilite/badge-disponibilite.component';
import { CatalogueService } from '../../services/catalogue.service';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';
import { SessionService } from '../../services/session.service';
import { versIdentifiant } from '../../utils/texte';

/** Fiche détaillée d'un équipement (/materiels/:id) avec bouton de réservation pour les étudiants. */
@Component({
  selector: 'app-detail-materiel-page',
  imports: [RouterLink, BadgeDisponibiliteComponent],
  templateUrl: './detail-materiel-page.component.html'
})
export class DetailMaterielPageComponent {
  protected readonly session = inject(SessionService);
  private readonly catalogue = inject(CatalogueService);
  private readonly reservations = inject(ReservationService);
  private readonly notifications = inject(NotificationService);

  /** Paramètre :id de l'URL (injecté par withComponentInputBinding). */
  readonly id = input<string>();

  /** undefined si l'identifiant est invalide ou ne correspond à aucun équipement. */
  protected readonly equipement = computed(() => {
    const id = versIdentifiant(this.id());
    return id === null ? undefined : this.catalogue.trouver(id);
  });

  protected readonly reservation = computed(() => {
    const equipement = this.equipement();
    return equipement ? this.reservations.reservationPour(equipement.id) : undefined;
  });

  protected readonly estReserve = computed(() => this.reservation() !== undefined);

  protected readonly reserveParMoi = computed(() => {
    const reservation = this.reservation();
    return reservation !== undefined && reservation.etudiantId === this.session.utilisateur()?.id;
  });

  reserver(): void {
    const equipement = this.equipement();
    if (equipement) {
      this.notifications.depuis(this.reservations.reserver(equipement));
    }
  }
}

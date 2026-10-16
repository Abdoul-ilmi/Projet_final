// Page listant les réservations de l'étudiant connecté.
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../../services/catalogue.service';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';

/** Réservations de l'étudiant connecté, avec lien vers la fiche et annulation. */
@Component({
  selector: 'app-mes-reservations-page',
  imports: [RouterLink],
  templateUrl: './mes-reservations-page.component.html'
})
export class MesReservationsPageComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly reservations = inject(ReservationService);
  private readonly notifications = inject(NotificationService);

  /** Chaque réservation de l'étudiant est associée à la fiche de l'équipement correspondant. */
  protected readonly lignes = computed(() =>
    this.reservations.mesReservations().flatMap((reservation) => {
      const equipement = this.catalogue.trouver(reservation.equipementId);
      return equipement ? [{ reservation, equipement }] : [];
    })
  );

  annuler(reservationId: string): void {
    this.notifications.depuis(this.reservations.annuler(reservationId));
  }
}

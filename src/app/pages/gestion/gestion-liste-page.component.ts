// Page responsable de consultation et de suppression du catalogue.
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeDisponibiliteComponent } from '../../components/badge-disponibilite/badge-disponibilite.component';
import { Equipement } from '../../data/donnees-initiales';
import { CatalogueService } from '../../services/catalogue.service';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';

/** Tableau de gestion du catalogue : modification et suppression (avec confirmation). */
@Component({
  selector: 'app-gestion-liste-page',
  imports: [RouterLink, BadgeDisponibiliteComponent],
  templateUrl: './gestion-liste-page.component.html'
})
export class GestionListePageComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly reservations = inject(ReservationService);
  private readonly notifications = inject(NotificationService);

  protected readonly equipements = this.catalogue.equipements;

  /** Équipement en attente de confirmation de suppression (null = aucune demande en cours). */
  protected readonly aSupprimer = signal<Equipement | null>(null);

  estDisponible(equipement: Equipement): boolean {
    return !this.reservations.estReserve(equipement.id);
  }

  demanderSuppression(equipement: Equipement): void {
    this.aSupprimer.set(equipement);
  }

  annulerSuppression(): void {
    this.aSupprimer.set(null);
  }

  /** Après confirmation, le service applique la règle : un équipement réservé ne peut pas être supprimé. */
  confirmerSuppression(): void {
    const equipement = this.aSupprimer();
    if (!equipement) {
      return;
    }
    this.notifications.depuis(this.catalogue.supprimer(equipement.id));
    this.aSupprimer.set(null);
  }
}

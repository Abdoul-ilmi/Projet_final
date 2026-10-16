// Navigation latérale et actions liées à la session courante.
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LIBELLES_ROLE } from '../../models/libelles';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';
import { SessionService } from '../../services/session.service';

/** Barre de navigation : les liens affichés dépendent du profil connecté. */
@Component({
  selector: 'app-barre-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barre-navigation.component.html'
})
export class BarreNavigationComponent {
  protected readonly session = inject(SessionService);
  protected readonly reservations = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected readonly libellesRole = LIBELLES_ROLE;

  deconnecter(): void {
    this.session.deconnecter();
    this.router.navigateByUrl('/login');
    this.notifications.info('Vous êtes déconnecté.');
  }
}

// Composant d'affichage des notifications globales.
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

/** Affiche le message courant du NotificationService (succès, erreur ou information). */
@Component({
  selector: 'app-bandeau-notification',
  templateUrl: './bandeau-notification.component.html'
})
export class BandeauNotificationComponent {
  protected readonly notifications = inject(NotificationService);
}

// Page de connexion simulée par sélection d'un compte de démonstration.
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Compte } from '../../data/donnees-initiales';
import { LIBELLES_ROLE } from '../../models/libelles';
import { NotificationService } from '../../services/notification.service';
import { SessionService } from '../../services/session.service';

/** Page publique : choix d'un compte de démonstration (connexion simulée, sans mot de passe). */
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected readonly libellesRole = LIBELLES_ROLE;

  choisir(compte: Compte): void {
    if (!this.session.connecter(compte.id)) {
      this.notifications.erreur('Ce compte de démonstration est introuvable.');
      return;
    }
    this.notifications.succes(`Bienvenue, ${compte.nom}.`);
    // Le responsable arrive sur son espace de gestion, l'étudiant sur le catalogue.
    this.router.navigateByUrl(compte.role === 'manager' ? '/gestion' : '/catalogue');
  }
}

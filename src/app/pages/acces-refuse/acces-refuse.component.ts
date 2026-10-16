// Page publique expliquant un refus d'accès lié au rôle.
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../services/session.service';

/** Explique pourquoi l'accès à une page est refusé (rôle insuffisant). */
@Component({
  selector: 'app-acces-refuse',
  imports: [RouterLink],
  templateUrl: './acces-refuse.component.html'
})
export class AccesRefuseComponent {
  protected readonly session = inject(SessionService);

  /** Rôle exigé, transmis dans l'URL (?requis=manager). */
  readonly requis = input<string>();

  protected readonly explication = computed(() => {
    switch (this.requis()) {
      case 'manager':
        return 'Cette page est réservée au responsable du matériel.';
      case 'student':
        return 'Cette page est réservée aux étudiants.';
      default:
        return "Votre profil ne permet pas d'accéder à cette page.";
    }
  });
}

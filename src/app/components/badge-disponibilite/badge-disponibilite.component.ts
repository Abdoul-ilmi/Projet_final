// Composant de présentation de l'état de disponibilité d'un équipement.
import { Component, input } from '@angular/core';

/** Pastille « Disponible » / « Réservé ». L'information est donnée par le texte, pas seulement par la couleur. */
@Component({
  selector: 'app-badge-disponibilite',
  template: `
    <span class="badge" [class.badge--libre]="disponible()" [class.badge--reserve]="!disponible()">
      {{ disponible() ? 'Disponible' : 'Réservé' }}
    </span>
  `
})
export class BadgeDisponibiliteComponent {
  readonly disponible = input.required<boolean>();
}

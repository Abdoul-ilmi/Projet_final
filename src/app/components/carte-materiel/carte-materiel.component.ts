// Carte de présentation d'un équipement dans le catalogue.
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Equipement } from '../../data/donnees-initiales';
import { BadgeDisponibiliteComponent } from '../badge-disponibilite/badge-disponibilite.component';

/**
 * Carte d'un équipement dans le catalogue.
 *
 * Composant « de présentation » : il reçoit ses données par des @Input (input()) et ne décide de rien.
 * Quand l'étudiant clique sur « Réserver », il EMET un événement (output()) vers son parent,
 * qui appelle le service de réservation. C'est l'exemple de communication enfant → parent.
 */
@Component({
  selector: 'app-carte-materiel',
  imports: [RouterLink, BadgeDisponibiliteComponent],
  templateUrl: './carte-materiel.component.html'
})
export class CarteMaterielComponent {
  readonly equipement = input.required<Equipement>();
  readonly disponible = input.required<boolean>();
  /** Vrai si le bouton « Réserver » doit être proposé (étudiant + matériel libre). */
  readonly reservable = input(false);

  /** Demande de réservation transmise au composant parent. */
  readonly demandeReservation = output<Equipement>();
}

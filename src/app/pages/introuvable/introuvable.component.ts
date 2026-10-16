// Page 404 affichée pour les URL inconnues.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Page 404 : affichée pour toute URL qui ne correspond à aucune route. */
@Component({
  selector: 'app-introuvable',
  imports: [RouterLink],
  templateUrl: './introuvable.component.html'
})
export class IntrouvableComponent {}

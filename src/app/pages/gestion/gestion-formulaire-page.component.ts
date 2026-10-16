// Page responsable de création et de modification d'un équipement.
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormulaireMaterielComponent } from '../../components/formulaire-materiel/formulaire-materiel.component';
import { CatalogueService, DonneesEquipement } from '../../services/catalogue.service';
import { NotificationService } from '../../services/notification.service';
import { versIdentifiant } from '../../utils/texte';

/**
 * Page unique pour /gestion/nouveau (création) et /gestion/:id/modifier (modification).
 * Elle choisit le mode selon la présence du paramètre :id et réutilise le même formulaire.
 */
@Component({
  selector: 'app-gestion-formulaire-page',
  imports: [FormulaireMaterielComponent, RouterLink],
  templateUrl: './gestion-formulaire-page.component.html'
})
export class GestionFormulairePageComponent {
  protected readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  /** Présent uniquement sur /gestion/:id/modifier. */
  readonly id = input<string>();

  protected readonly modeModification = computed(() => this.id() !== undefined);

  protected readonly equipement = computed(() => {
    const id = versIdentifiant(this.id());
    return id === null ? undefined : this.catalogue.trouver(id);
  });

  enregistrer(donnees: DonneesEquipement): void {
    const equipement = this.equipement();

    if (this.modeModification() && equipement) {
      const resultat = this.catalogue.modifier(equipement.id, donnees);
      this.notifications.depuis(resultat);
      if (resultat.ok) {
        this.router.navigateByUrl('/gestion');
      }
      return; // En cas d'échec, on reste sur le formulaire : la saisie est conservée.
    }

    const cree = this.catalogue.creer(donnees);
    if (cree) {
      this.notifications.succes(`« ${cree.nom} » a été ajouté au catalogue.`);
      this.router.navigateByUrl('/gestion');
    } else {
      this.notifications.erreur('Création annulée : la fiche n\'a pas pu être enregistrée.');
    }
  }

  retour(): void {
    this.router.navigateByUrl('/gestion');
  }
}

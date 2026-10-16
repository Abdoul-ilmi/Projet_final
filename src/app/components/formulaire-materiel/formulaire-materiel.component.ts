// Formulaire réutilisable de création et de modification d'un équipement.
import { Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categorie, Equipement } from '../../data/donnees-initiales';
import { DonneesEquipement } from '../../services/catalogue.service';
import { texteObligatoire } from '../../validators/texte.validator';

type NomChamp = 'nom' | 'categorie' | 'description' | 'localisation';

/**
 * Formulaire unique pour CRÉER et MODIFIER un équipement (formulaire réactif).
 *
 *  - création     : aucun équipement fourni → champs vides ;
 *  - modification : l'équipement fourni pré-remplit les champs.
 *
 * Le composant ne sauvegarde rien lui-même : il émet `soumis` avec les données valides
 * et la page parente décide quoi en faire. En cas d'erreur, les saisies sont conservées.
 */
@Component({
  selector: 'app-formulaire-materiel',
  imports: [ReactiveFormsModule],
  templateUrl: './formulaire-materiel.component.html'
})
export class FormulaireMaterielComponent implements OnInit {
  readonly equipement = input<Equipement | null>(null);
  readonly categories = input.required<readonly Categorie[]>();

  readonly soumis = output<DonneesEquipement>();
  readonly annule = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly formulaire = this.fb.group({
    nom: ['', [texteObligatoire(3)]],
    categorie: ['' as Categorie | '', [Validators.required]],
    description: ['', [texteObligatoire(10)]],
    localisation: ['', [texteObligatoire(1)]]
  });

  ngOnInit(): void {
    // Mode modification : on pré-remplit le formulaire avec la fiche existante.
    const existant = this.equipement();
    if (existant) {
      this.formulaire.patchValue({
        nom: existant.nom,
        categorie: existant.categorie,
        description: existant.description,
        localisation: existant.localisation
      });
    }
  }

  soumettre(): void {
    if (this.formulaire.invalid) {
      // On affiche toutes les erreurs d'un coup ; les valeurs saisies restent dans le formulaire.
      this.formulaire.markAllAsTouched();
      return;
    }
    const valeurs = this.formulaire.getRawValue();
    this.soumis.emit({
      nom: valeurs.nom.trim(),
      categorie: valeurs.categorie as Categorie,
      description: valeurs.description.trim(),
      localisation: valeurs.localisation.trim()
    });
  }

  /** Message d'erreur compréhensible pour un champ, ou null s'il n'y a rien à signaler. */
  messageErreur(champ: NomChamp): string | null {
    const controle = this.formulaire.controls[champ];
    if (!controle.touched || !controle.errors) {
      return null;
    }
    if (controle.errors['required']) {
      return champ === 'categorie'
        ? 'Choisissez une catégorie dans la liste.'
        : 'Ce champ est obligatoire.';
    }
    const tropCourt = controle.errors['texteTropCourt'];
    if (tropCourt) {
      return `Saisissez au moins ${tropCourt.requis} caractères (actuellement ${tropCourt.actuel}).`;
    }
    return 'Valeur invalide.';
  }
}

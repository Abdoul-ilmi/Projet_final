import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valide un champ texte obligatoire d'au moins `minimum` caractères.
 * Les espaces au début et à la fin sont ignorés : « ab   » compte pour 2 caractères
 * et une saisie composée uniquement d'espaces est considérée comme vide.
 *
 * Erreurs possibles :
 *  - { required: true }                         → champ vide
 *  - { texteTropCourt: { requis, actuel } }     → trop court
 */
export function texteObligatoire(minimum: number): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const longueur = String(controle.value ?? '').trim().length;
    if (longueur === 0) {
      return { required: true };
    }
    if (longueur < minimum) {
      return { texteTropCourt: { requis: minimum, actuel: longueur } };
    }
    return null;
  };
}

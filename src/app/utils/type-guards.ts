import { CATEGORIES, Equipement, Reservation } from '../data/donnees-initiales';

/**
 * Les données lues dans localStorage peuvent avoir été modifiées à la main ou corrompues.
 * Ces fonctions vérifient la forme des objets avant de les utiliser dans l'application.
 */
function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null;
}

export function estEquipement(valeur: unknown): valeur is Equipement {
  return (
    estObjet(valeur) &&
    typeof valeur['id'] === 'number' &&
    typeof valeur['nom'] === 'string' &&
    CATEGORIES.some((categorie) => categorie === valeur['categorie']) &&
    typeof valeur['description'] === 'string' &&
    typeof valeur['localisation'] === 'string'
  );
}

export function estReservation(valeur: unknown): valeur is Reservation {
  return (
    estObjet(valeur) &&
    typeof valeur['id'] === 'string' &&
    typeof valeur['equipementId'] === 'number' &&
    typeof valeur['etudiantId'] === 'number'
  );
}

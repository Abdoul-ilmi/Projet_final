/**
 * Résultat d'une opération métier (réserver, annuler, supprimer…).
 * Les services ne manipulent pas l'interface : ils renvoient ce résultat
 * et c'est la page appelante qui décide de l'afficher (voir NotificationService.depuis).
 */
export interface Resultat {
  ok: boolean;
  message: string;
}

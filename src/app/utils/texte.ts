/**
 * Normalise un texte pour la recherche : minuscules, sans accents, sans espaces superflus.
 * Exemple : « Vidéoprojecteur » → « videoprojecteur ».
 */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Convertit un paramètre d'URL en identifiant numérique.
 * Renvoie null si la valeur n'est pas un entier positif (ex. « abc », « 12.5 », « »).
 */
export function versIdentifiant(valeur: string | undefined): number | null {
  return valeur !== undefined && /^\d+$/.test(valeur) ? Number(valeur) : null;
}

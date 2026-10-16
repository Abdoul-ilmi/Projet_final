/**
 * Génère un identifiant unique pour une réservation.
 * crypto.randomUUID() n'existe que dans un contexte sécurisé (https ou localhost) :
 * on prévoit donc une solution de secours pour les autres cas.
 */
export function genererIdentifiant(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

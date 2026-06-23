/**
 * Eligibilite au tarif "membre" (Parameters.TarifMember) lorsqu'un autre membre de la
 * famille est deja inscrit cette saison. Le lien de parente declare (start-form, etape 1)
 * ne suffit pas seul : la regle depend aussi du statut majeur/mineur du principal (la
 * personne en cours d'inscription), connu seulement une fois sa date de naissance saisie
 * a l'etape 2 -- voir InscriptionPageComponent.updateAdhesionMontant().
 *
 * - Principal majeur : le membre deja inscrit doit etre son epoux/epouse ou son enfant
 *   mineur. Un enfant majeur ne qualifie pas.
 * - Principal mineur : le membre deja inscrit doit etre un frere/soeur mineur(e) ou un
 *   parent (pere/mere).
 *
 * Dans tous les autres cas (lien non reconnu pour le statut du principal), le tarif plein
 * (TarifLocal ou TarifExterior selon le code postal) s'applique.
 */

export const LIENS_PRINCIPAL_MAJEUR = ['Époux/Épouse', 'Enfant mineur', 'Enfant majeur'] as const;
export const LIENS_PRINCIPAL_MINEUR = ['Pére', 'Mère', 'Frère mineur', 'Soeur mineure'] as const;

const LIENS_ELIGIBLES_PRINCIPAL_MAJEUR: readonly string[] = ['Époux/Épouse', 'Enfant mineur'];
const LIENS_ELIGIBLES_PRINCIPAL_MINEUR: readonly string[] = ['Pére', 'Mère', 'Frère mineur', 'Soeur mineure'];

export function isMemberTariffEligible(principalIsAdult: boolean, lien: string): boolean {
  const liensEligibles = principalIsAdult ? LIENS_ELIGIBLES_PRINCIPAL_MAJEUR : LIENS_ELIGIBLES_PRINCIPAL_MINEUR;
  return liensEligibles.includes(lien);
}

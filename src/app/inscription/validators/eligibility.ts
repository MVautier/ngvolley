/**
 * Calculs d'âge/éligibilité partagés entre InscriptionService.checkAdherent et
 * CustomValidators.dateCheck.
 *
 * Avant ce fichier, les deux endroits calculaient une notion d'âge légèrement
 * différente : InscriptionService utilisait la saison admin (AdherentService.obsSeason)
 * tandis que CustomValidators.dateCheck utilisait l'année calendaire réelle
 * (new Date().getFullYear()), avec une date seuil "31 décembre" différente entre les
 * deux. C'est cette divergence qui avait nécessité le correctif historique du
 * commit a366261 ("correctif 18 ans") -- corrigé uniquement dans InscriptionService,
 * pas dans CustomValidators. Toute logique d'éligibilité par âge doit passer par les
 * fonctions ci-dessous pour ne pas réintroduire cette dérive.
 *
 * Référence temporelle commune : la saison admin (année de début de saison), pas
 * l'année calendaire réelle, et le 31 décembre comme date seuil.
 *
 * Ne concerne pas CustomValidators.checkAdult() (majorité du payeur), qui utilise
 * intentionnellement une référence distincte (année calendaire réelle, 1er septembre) --
 * voir le commentaire sur checkAdult().
 */

/** Date avant laquelle il faut être né pour être majeur (catégories C/L) pendant la saison donnée. */
export function getAdultCutoffDate(seasonYear: number): Date {
  return new Date(seasonYear - 18, 11, 31);
}

/** Date avant laquelle il faut être né pour avoir au moins `minAge` ans pendant la saison donnée. */
export function getMinAgeCutoffDate(seasonYear: number, minAge: number): Date {
  return new Date(seasonYear + 1 - minAge, 11, 31);
}

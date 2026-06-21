/**
 * Substitution du jeton {saison} dans les textes admin-editables (Parameters.SubHeader/
 * Text1/Text2/Text3, voir /admin -> Parametres). Permet de rediger un message une seule
 * fois ("... pour la saison {saison} ...") sans avoir a le reecrire chaque saison : le
 * jeton est remplace par la plage "annee-annee+1" (ex: 2026-2027), la meme convention
 * deja utilisee partout ailleurs dans l'app (InscriptionPageComponent.init() notamment).
 */
export function applySeasonToken(text: string, seasonYear: number): string {
  if (!text) {
    return text;
  }
  return text.replace(/\{saison\}/g, `${seasonYear}-${seasonYear + 1}`);
}

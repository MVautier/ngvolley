import { getAdultCutoffDate, getMinAgeCutoffDate } from './eligibility';

describe('eligibility', () => {
  describe('getAdultCutoffDate', () => {
    it('retourne le 31 décembre de (saison - 18)', () => {
      const result = getAdultCutoffDate(2026);
      expect(result.getFullYear()).toBe(2008);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('getMinAgeCutoffDate', () => {
    it('retourne le 31 décembre de (saison + 1 - minAge)', () => {
      const result = getMinAgeCutoffDate(2026, 13);
      expect(result.getFullYear()).toBe(2014);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });

    it('reflète le minAge fourni (cas environment.minage)', () => {
      const result = getMinAgeCutoffDate(2026, 18);
      expect(result.getFullYear()).toBe(2009);
    });
  });

  it('un adhérent né exactement à la date seuil des 18 ans est sous la borne adulte mais à la borne min-age 13 ans de la saison suivante', () => {
    // Régression du commit a366261 ("correctif 18 ans") : verrouille la borne exacte
    // pour éviter qu'un futur changement réintroduise l'incohérence entre
    // InscriptionService et CustomValidators sur cette date pivot.
    const seasonYear = 2026;
    const adultCutoff = getAdultCutoffDate(seasonYear);
    const minAgeCutoff = getMinAgeCutoffDate(seasonYear, 13);
    expect(adultCutoff.getTime()).toBeLessThan(minAgeCutoff.getTime());
  });
});

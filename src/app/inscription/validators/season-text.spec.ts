import { applySeasonToken } from './season-text';

describe('applySeasonToken', () => {
  it('remplace {saison} par la plage saison-saison+1', () => {
    expect(applySeasonToken('Inscriptions pour {saison}.', 2026)).toBe('Inscriptions pour 2026-2027.');
  });

  it('remplace toutes les occurrences', () => {
    expect(applySeasonToken('{saison} puis encore {saison}.', 2026)).toBe('2026-2027 puis encore 2026-2027.');
  });

  it('retourne le texte inchangé si aucun jeton', () => {
    expect(applySeasonToken('Aucun jeton ici.', 2026)).toBe('Aucun jeton ici.');
  });

  it('retourne null/undefined/chaîne vide tels quels', () => {
    expect(applySeasonToken(null, 2026)).toBeNull();
    expect(applySeasonToken(undefined, 2026)).toBeUndefined();
    expect(applySeasonToken('', 2026)).toBe('');
  });
});

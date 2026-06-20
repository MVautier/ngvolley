import { isMemberTariffEligible } from './member-tariff';

describe('isMemberTariffEligible', () => {
  describe('principal majeur', () => {
    it('éligible si le lien est Époux/Épouse', () => {
      expect(isMemberTariffEligible(true, 'Époux/Épouse')).toBeTrue();
    });

    it('éligible si le lien est Enfant mineur', () => {
      expect(isMemberTariffEligible(true, 'Enfant mineur')).toBeTrue();
    });

    it("non éligible si le lien est Enfant majeur (l'enfant n'est plus à charge)", () => {
      expect(isMemberTariffEligible(true, 'Enfant majeur')).toBeFalse();
    });

    it('non éligible pour un lien réservé au principal mineur (Pére)', () => {
      expect(isMemberTariffEligible(true, 'Pére')).toBeFalse();
    });
  });

  describe('principal mineur', () => {
    it('éligible si le lien est Pére', () => {
      expect(isMemberTariffEligible(false, 'Pére')).toBeTrue();
    });

    it('éligible si le lien est Mère', () => {
      expect(isMemberTariffEligible(false, 'Mère')).toBeTrue();
    });

    it('éligible si le lien est Frère mineur', () => {
      expect(isMemberTariffEligible(false, 'Frère mineur')).toBeTrue();
    });

    it('éligible si le lien est Soeur mineure', () => {
      expect(isMemberTariffEligible(false, 'Soeur mineure')).toBeTrue();
    });

    it('non éligible pour un lien réservé au principal majeur (Époux/Épouse)', () => {
      expect(isMemberTariffEligible(false, 'Époux/Épouse')).toBeFalse();
    });

    it('non éligible pour un lien réservé au principal majeur (Enfant mineur)', () => {
      expect(isMemberTariffEligible(false, 'Enfant mineur')).toBeFalse();
    });
  });

  it('non éligible pour un lien inconnu', () => {
    expect(isMemberTariffEligible(true, 'Autre')).toBeFalse();
    expect(isMemberTariffEligible(false, 'Autre')).toBeFalse();
  });
});

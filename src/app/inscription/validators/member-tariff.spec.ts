import { isCartMemberTariffEligible, isMemberTariffEligible } from './member-tariff';

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

describe('isCartMemberTariffEligible', () => {
  describe('principal majeur', () => {
    it('éligible si le membre est le conjoint, majeur', () => {
      expect(isCartMemberTariffEligible(true, 'C', true)).toBeTrue();
    });

    it('éligible si le membre est un enfant mineur', () => {
      expect(isCartMemberTariffEligible(true, 'E', false)).toBeTrue();
    });

    it("non éligible si le membre est un enfant majeur (il paie le tarif plein)", () => {
      expect(isCartMemberTariffEligible(true, 'E', true)).toBeFalse();
    });

    it('non éligible pour un lien réservé au principal mineur (parent)', () => {
      expect(isCartMemberTariffEligible(true, 'P', true)).toBeFalse();
    });
  });

  describe('principal mineur', () => {
    it('éligible si le membre est un parent', () => {
      expect(isCartMemberTariffEligible(false, 'P', true)).toBeTrue();
    });

    it('éligible si le membre est un frère mineur', () => {
      expect(isCartMemberTariffEligible(false, 'F', false)).toBeTrue();
    });

    it('éligible si le membre est une soeur mineure', () => {
      expect(isCartMemberTariffEligible(false, 'S', false)).toBeTrue();
    });

    it('non éligible si le frère est majeur', () => {
      expect(isCartMemberTariffEligible(false, 'F', true)).toBeFalse();
    });

    it('non éligible pour un lien réservé au principal majeur (conjoint)', () => {
      expect(isCartMemberTariffEligible(false, 'C', true)).toBeFalse();
    });
  });

  it('non éligible tant que le lien n\'est pas saisi', () => {
    expect(isCartMemberTariffEligible(true, null, false)).toBeFalse();
  });
});

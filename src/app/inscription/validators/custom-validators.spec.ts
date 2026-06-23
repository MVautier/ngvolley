import { AbstractControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';
import { CheckAdherent } from '../models/check-adherent.model';

function control(value: any): AbstractControl {
  return { value } as AbstractControl;
}

describe('CustomValidators', () => {
  describe('dateCheck', () => {
    const seasonYear = 2026;

    it('ne renvoie aucune erreur si la valeur est null', () => {
      const checked = new CheckAdherent();
      expect(CustomValidators.dateCheck(checked, seasonYear)(control(null))).toBeNull();
    });

    it("renvoie 'date-minimum' si l'adhérent a moins de environment.minage ans à la fin de la saison", () => {
      const checked = new CheckAdherent();
      checked.birthdayDateValid = true;
      // minage = 13 -> doit être né au plus tard le 31/12/2014 pour avoir 13 ans en 2027 (saison+1)
      const result = CustomValidators.dateCheck(checked, seasonYear)(control(new Date(2020, 0, 1)));
      expect(result).not.toBeNull();
      expect(result['date-minimum']).toBeDefined();
    });

    it("renvoie 'date-section' si l'âge minimum est atteint mais que checked.birthdayDateValid est faux (catégorie incohérente avec la date de naissance)", () => {
      const checked = new CheckAdherent();
      checked.birthdayDateValid = false;
      const result = CustomValidators.dateCheck(checked, seasonYear)(control(new Date(2000, 0, 1)));
      expect(result).not.toBeNull();
      expect(result['date-section']).toBeDefined();
    });

    it('ne renvoie aucune erreur si l\'âge minimum est atteint et birthdayDateValid est vrai', () => {
      const checked = new CheckAdherent();
      checked.birthdayDateValid = true;
      const result = CustomValidators.dateCheck(checked, seasonYear)(control(new Date(2000, 0, 1)));
      expect(result).toBeNull();
    });
  });

  describe('checkAdult', () => {
    it('ne renvoie aucune erreur si la valeur est null', () => {
      expect(CustomValidators.checkAdult()(control(null))).toBeNull();
    });

    it("renvoie 'date-adulte' pour une personne mineure", () => {
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 10);
      const result = CustomValidators.checkAdult()(control(tooYoung));
      expect(result).not.toBeNull();
      expect(result['date-adulte']).toBeDefined();
    });

    it('ne renvoie aucune erreur pour une personne manifestement majeure', () => {
      const adult = new Date(1980, 0, 1);
      expect(CustomValidators.checkAdult()(control(adult))).toBeNull();
    });
  });

  describe('licenceCheck', () => {
    it('ne renvoie aucune erreur si la valeur est null', () => {
      const checked = new CheckAdherent();
      expect(CustomValidators.licenceCheck(checked)(control(null))).toBeNull();
    });

    it("renvoie 'format' si le numéro ne respecte pas le format attendu", () => {
      const checked = new CheckAdherent();
      const result = CustomValidators.licenceCheck(checked)(control('abc'));
      expect(result).not.toBeNull();
      expect(result['format']).toBeDefined();
    });

    it("renvoie 'licence' si le numéro ne correspond pas à celui déjà connu pour cet adhérent", () => {
      const checked = new CheckAdherent();
      checked.found = { Licence: '123456' } as any;
      const result = CustomValidators.licenceCheck(checked)(control('654321'));
      expect(result).not.toBeNull();
      expect(result['licence']).toBeDefined();
    });

    it('ne renvoie aucune erreur si le numéro correspond', () => {
      const checked = new CheckAdherent();
      checked.found = { Licence: '123456' } as any;
      expect(CustomValidators.licenceCheck(checked)(control('123456'))).toBeNull();
    });
  });

  describe('checkName', () => {
    it('accepte un nom valide', () => {
      expect(CustomValidators.checkName()(control('Dupont'))).toBeNull();
    });

    it('rejette une valeur de la liste interdite', () => {
      expect(CustomValidators.checkName()(control('test'))).not.toBeNull();
    });

    it('rejette un nom contenant des chiffres', () => {
      expect(CustomValidators.checkName()(control('Dup0nt'))).not.toBeNull();
    });

    it('rejette un nom sans voyelle', () => {
      expect(CustomValidators.checkName()(control('Brrr'))).not.toBeNull();
    });

    it('rejette un nom avec 3 caractères répétitifs', () => {
      expect(CustomValidators.checkName()(control('Aaaa'))).not.toBeNull();
    });
  });

  describe('nullOrPatternCheck', () => {
    it('ne renvoie aucune erreur si la valeur est vide', () => {
      expect(CustomValidators.nullOrPatternCheck(/[0-9]+/)(control(''))).toBeNull();
    });

    it('renvoie une erreur si le format ne correspond pas', () => {
      expect(CustomValidators.nullOrPatternCheck(/^[0-9]+$/)(control('abc'))).not.toBeNull();
    });

    it("ne renvoie aucune erreur si le format correspond", () => {
      expect(CustomValidators.nullOrPatternCheck(/^[0-9]+$/)(control('123'))).toBeNull();
    });
  });
});

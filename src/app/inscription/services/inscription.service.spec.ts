import { BehaviorSubject } from 'rxjs';
import { InscriptionService } from './inscription.service';
import { AdherentService } from '@app/core/services/adherent.service';
import { Adherent } from '@app/core/models/adherent.model';
import { Category } from '@app/core/models/category.model';
import { Parameters } from '@app/core/models/parameters.model';
import { CheckAdherent } from '../models/check-adherent.model';

describe('InscriptionService', () => {
  let service: InscriptionService;
  let adherentService: jasmine.SpyObj<AdherentService>;
  const seasonYear = 2026;

  beforeEach(() => {
    adherentService = jasmine.createSpyObj('AdherentService', ['searchAdherent']);
    (adherentService as any).obsSeason = new BehaviorSubject<number>(seasonYear);
    service = new InscriptionService(adherentService);
  });

  function adherent(category: string, birthdayDate: Date): Adherent {
    return { Category: category, BirthdayDate: birthdayDate, Authorization: null, Rgpd: true, Signature: null, Age: 0 } as any;
  }

  describe('checkAdherent - éligibilité par catégorie', () => {
    it('catégorie C (adulte) : valide pour une personne née avant le seuil des 18 ans de la saison', async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('C', new Date(2000, 0, 1)), 2);
      expect(check.birthdayDateValid).toBeTrue();
    });

    it("catégorie C (adulte) : invalide pour une personne née exactement à la date seuil des 18 ans (pas encore majeure à la date pivot)", () => {
      return service.checkAdherent(new CheckAdherent(), adherent('C', new Date(seasonYear - 18, 11, 31)), 2).then(check => {
        expect(check.birthdayDateValid).toBeFalse();
      });
    });

    it('catégorie E (ado) : valide pour une personne née exactement à la date seuil des 18 ans (juste sous la barre adulte)', async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('E', new Date(seasonYear - 18, 11, 31)), 2);
      expect(check.birthdayDateValid).toBeTrue();
    });

    it("catégorie E (ado) : invalide pour une personne plus jeune que l'âge minimum (environment.minage)", async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('E', new Date(2020, 0, 1)), 2);
      expect(check.birthdayDateValid).toBeFalse();
    });

    it("catégorie E (ado) : nécessite une autorisation parentale si non déjà fournie", async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('E', new Date(2014, 0, 1)), 2);
      expect(check.parentAuthNeeded).toBeTrue();
    });

    it("catégorie C/L : ne nécessite jamais d'autorisation parentale", async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('C', new Date(2000, 0, 1)), 2);
      expect(check.parentAuthNeeded).toBeFalse();
    });
  });

  describe('checkAdherent - règles désactivées', () => {
    it('certifNeeded reste toujours faux (désactivé intentionnellement)', async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('C', new Date(2000, 0, 1)), 3);
      expect(check.certifNeeded).toBeFalse();
    });

    it('licenceNeeded reste toujours faux (désactivé intentionnellement)', async () => {
      const check = await service.checkAdherent(new CheckAdherent(), adherent('C', new Date(2000, 0, 1)), 3);
      expect(check.licenceNeeded).toBeFalse();
    });
  });

  describe('filterOpenCategories', () => {
    const categories: Category[] = [
      { IdCategory: 1, Code: 'C', Libelle: 'Compétition', Blocked: false },
      { IdCategory: 2, Code: 'L', Libelle: 'Loisirs', Blocked: false },
      { IdCategory: 3, Code: 'E', Libelle: 'Ados', Blocked: false }
    ];

    it('retourne toutes les catégories si params est absent', () => {
      expect(service.filterOpenCategories(categories, null).length).toBe(3);
    });

    it('retire une catégorie explicitement fermée par les paramètres admin', () => {
      const params = { AdoOpened: true, LoisirOpened: false, CompetOpened: true } as Parameters;
      const result = service.filterOpenCategories(categories, params);
      expect(result.map(c => c.Code)).toEqual(['C', 'E']);
    });

    it('laisse une catégorie ouverte si le paramètre correspondant est absent (fail-open)', () => {
      const params = {} as Parameters;
      const result = service.filterOpenCategories(categories, params);
      expect(result.length).toBe(3);
    });
  });

  describe('isNull', () => {
    it('considère null, undefined et chaîne vide comme "null"', () => {
      expect(service.isNull(null)).toBeTrue();
      expect(service.isNull(undefined)).toBeTrue();
      expect(service.isNull('')).toBeTrue();
    });

    it('ne considère pas une valeur renseignée comme "null"', () => {
      expect(service.isNull('valeur')).toBeFalse();
      expect(service.isNull(0)).toBeFalse();
    });
  });
});

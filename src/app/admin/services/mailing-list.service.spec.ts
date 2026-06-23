import { MailingListService } from './mailing-list.service';

describe('MailingListService', () => {
  let service: MailingListService;

  beforeEach(() => {
    service = new MailingListService();
  });

  it("ajoute un email à la liste", () => {
    const added = service.add('test@example.com');
    expect(added).toBeTrue();
    expect(service.value).toEqual(['test@example.com']);
  });

  it("refuse un email déjà présent (dédoublonnage insensible à la casse)", () => {
    service.add('Test@Example.com');
    const added = service.add('test@example.com');
    expect(added).toBeFalse();
    expect(service.value).toEqual(['Test@Example.com']);
  });

  it("refuse un email vide ou null", () => {
    expect(service.add('')).toBeFalse();
    expect(service.add(null)).toBeFalse();
    expect(service.value).toEqual([]);
  });

  it("retire un email de la liste", () => {
    service.add('a@example.com');
    service.add('b@example.com');
    service.remove('a@example.com');
    expect(service.value).toEqual(['b@example.com']);
  });

  it("vide la liste", () => {
    service.add('a@example.com');
    service.add('b@example.com');
    service.clear();
    expect(service.value).toEqual([]);
  });

  it("notifie list$ à chaque changement", () => {
    const emissions: string[][] = [];
    service.list$.subscribe(list => emissions.push(list));
    service.add('a@example.com');
    service.remove('a@example.com');
    expect(emissions).toEqual([[], ['a@example.com'], []]);
  });
});

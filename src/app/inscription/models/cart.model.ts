import { Adherent } from "@app/core/models/adherent.model";
import { environment } from "@env/environment";
import { CartItem } from "./cart-item.model";
import { Client } from "@app/core/models/client.model";

export class Cart {
  id: number;
  items: CartItem[];
  date: Date;
  total: number;
  client?: Client;

  constructor() {
    this.id = 0;
    this.items = [];
    this.date = new Date();
    this.total = 0;
  }

  // type = adhesion || membre || categorie
  public addItem(item: CartItem) {
    const items = this.getFlatItems(this.items);
    const index = items.findIndex(i => i.type === item.type && i.user[0] === item.user[0]);
    if (index >= 0) {
      items.splice(index, 1);
    }
    items.push(item);
    this.items = this.getGroupItems(items);
    this.updateTotal();
  }

  public updateUid(old: string, uid: string) {
    const items = this.getFlatItems(this.items);
    const found = this.items.filter(i => i.user[0] === old);
    if (found && found.length) {
      found.forEach(i => {
        i.user[0] = uid;
      });
      this.items = this.getGroupItems(items);
    }
  }

  public removeItem(user: string) {
    let items = this.getFlatItems(this.items);
    items = items.filter(i => i.user[0] !== user);
    this.items = this.getGroupItems(items);
    this.updateTotal();
  }

  public updateTotal() {
    this.total = this.items.map(i => i.montant).reduce((a, b) => { return a + b; });
  }

  /**
   * Part CLLL revenant a une personne du panier : sa ligne d'adhesion principale ou sa ligne
   * membre. Les lignes 'categorie' (licence/loisir) reviennent au club et sont exclues.
   */
  public getC3lAmount(uid: string): number {
    if (!uid) {
      return 0;
    }
    return this.getFlatItems(this.items)
      .filter(i => (i.type === 'adhesion' || i.type === 'membre') && i.user[0] === uid)
      .map(i => i.montant)
      .reduce((a, b) => a + b, 0);
  }

  public setClient(adherent: Adherent) {
    this.client = this.mapAdherentToClient(adherent);
  }

  private getFlatItems(items: CartItem[]): CartItem[] {
    const regex = /\sx[0-9]{1,}/g;
    const liste: CartItem[] = [];
    items.forEach(item => {
      if (item.user.length > 1) {
        const montant = item.montant / item.user.length;
        item.user.forEach(i => {
          liste.push({
            type: item.type,
            libelle: item.libelle.replace(regex, ''),
            montant: montant,
            user: [i]
          });
        });
      } else {
        item.libelle = item.libelle.replace(regex, '');
        liste.push(item);
      }
    });
    return liste;
  }

  mapAdherentToClient(adherent: Adherent): Client {
    return {
      FirstName: adherent.FirstName,
      LastName: adherent.LastName,
      BirthdayDate: adherent.BirthdayDate,
      Address: adherent.Address,
      PostalCode: adherent.PostalCode,
      City: adherent.City,
      Email: adherent.Email,
      adhesionType: adherent.Membres?.length ? 'multiple' : 'simple',
      Age: Adherent.getAge(adherent.BirthdayDate)
    }
  }

  private getGroupItems(items: CartItem[]): CartItem[] {

    const liste: CartItem[] = [];
    const a = items.filter(i => i.type === 'adhesion');
    const m = items.filter(i => i.type === 'membre');
    let c = items.filter(i => i.type === 'categorie');

    if (a.length) {
      const ad = a[0];
      ad.libelle += ' x1';
      liste.push(ad);
      const ac = c.find(i => i.user[0] === ad.user[0]);
      if (ac) {
        ac.libelle += ' x1';
        liste.push(ac);
        c = c.filter(i => i.user[0] !== ad.user[0])
      }
    }
    if (m.length) {
      // Les membres n'ont pas tous le meme tarif (cf. computeMembreMontant : un enfant majeur
      // paie le tarif plein). On ne regroupe que ceux de montant identique, sinon getFlatItems
      // redistribuerait le montant groupe a parts egales et fausserait chaque ligne.
      const montants: number[] = [];
      m.forEach(i => {
        if (!montants.includes(i.montant)) {
          montants.push(i.montant);
        }
      });
      montants.forEach(montant => {
        liste.push(this.groupItems(m.filter(i => i.montant === montant)));
      });
    }
    if (c.length) {
      const categs: string[] = [];
      c.forEach(i => {
        if (!categs.includes(i.libelle)) {
          categs.push(i.libelle);
        }
      });
      categs.forEach(categ => {
        const tmp = c.filter(i => i.libelle === categ);
        liste.push(this.groupItems(tmp));
      });
    }

    return liste;
  }

  private groupItems(items: CartItem[]): CartItem {
    let item: CartItem;
    if (items.length > 1) {
      item = {
        type: items[0].type,
        libelle: items[0].libelle + ' x' + items.length,
        montant: items.map(i => i.montant).reduce((a, b) => { return a + b; }),
        user: items.map(i => i.user[0])
      }
    } else {
      item = items[0];
      item.libelle + ' x1';
    }
    return item;
  }
}
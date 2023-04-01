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

    public removeItem(user: string) {
        let items = this.getFlatItems(this.items);
        items = items.filter(i => i.user[0] !== user);
        this.items = this.getGroupItems(items);
        this.updateTotal();
    }

    public updateTotal() {
        this.total = this.items.map(i => i.montant).reduce((a, b) => { return a + b; });
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
            adhesionType: adherent.Membres.length ? 'multiple' : 'simple'
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
            liste.push(this.groupItems(m));
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
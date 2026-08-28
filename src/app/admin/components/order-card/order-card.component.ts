import { Component, Input, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { Order } from '@app/core/models/order.model';
import { OrderFull } from '@app/core/models/order-full.model';

@Component({
    selector: 'app-order-card',
    templateUrl: './order-card.component.html',
    styleUrls: ['./order-card.component.scss'],
    standalone: false
})
export class OrderCardComponent implements OnInit {
  @Input() data: OrderFull;
  montantC3l: number = 0;
  montantClub: number = 0;
  montantTotal: number = 0;
  memberOrders: OrderFull[] = [];
  isHelloAsso: boolean = true;

  /**
   * Libelles des liens de parente, tels que saisis par le membre a l'inscription. Affiches
   * ici parce que le lien conditionne l'eligibilite au tarif reduit : sans lui, rien ne
   * permet de verifier qu'une part CLLL reduite etait justifiee.
   */
  private static readonly RELATIONSHIP_LABELS: { [code: string]: string } = {
    P: 'parent',
    C: 'conjoint',
    E: 'enfant',
    F: 'frère',
    S: 'soeur'
  };

  constructor() { }

  get memberLabel(): string {
    const label = OrderCardComponent.RELATIONSHIP_LABELS[this.data?.Relationship];
    return label ? 'membre (' + label + ')' : 'membre';
  }

  ngOnInit(): void {
    this.isHelloAsso = this.data.PaymentMode === 'Helloasso';
    if (this.data) {
      if (this.isHelloAsso) {
        // Ligne d'un membre du foyer : il n'a pas de commande propre, seule sa part CLLL
        // (C3lShare) est connue. Ligne du payeur : la commande porte le total CLLL.
        this.montantC3l = this.data.IdParent ? this.data.C3lShare : this.data.CotisationC3L;
        this.montantTotal = this.data.Total;
        this.montantClub = this.montantTotal - this.montantC3l;
      }
      if (this.data.Membres && this.data.Membres.length) {
        this.data.Membres.forEach(m => {
          if (m.Orders?.length) {
            m.Orders.forEach(o => {
              this.memberOrders.push(this.asMemberOrder(m, o));
            });
          } else {
            this.memberOrders.push(this.asMemberOrder(m, null));
          }
        });
      }
    }
  }

  /**
   * Un membre du foyer n'a pas de commande : OrderFull le classerait donc en 'Manuel'. On lui
   * applique le mode de paiement du payeur pour que sa ligne s'affiche dans le meme tableau,
   * avec sa part CLLL.
   */
  private asMemberOrder(member: Adherent, order: Order): OrderFull {
    const memberOrder = new OrderFull(member, order);
    memberOrder.PaymentMode = this.data.PaymentMode;
    return memberOrder;
  }
}

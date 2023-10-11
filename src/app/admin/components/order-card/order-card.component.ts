import { Component, Input, OnInit } from '@angular/core';
import { OrderFull } from '@app/core/models/order-full.model';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit {
@Input() data: OrderFull;
montantC3l: number = 0;
montantClub: number = 0;
montantTotal: number = 0;
memberOrders: OrderFull[] = [];
isHelloAsso: boolean = true;
  constructor() { }

  ngOnInit(): void {
    this.isHelloAsso = this.data?.Id !== undefined;
    if (this.data) {
        if (this.isHelloAsso) {
            this.montantC3l = this.data.CotisationC3L;
            this.montantTotal = this.data.Total;
            this.montantClub = this.montantTotal - this.montantC3l;
        }
        if (this.data.Membres && this.data.Membres.length) {
            this.data.Membres.forEach(m => {
                if (m.Orders?.length) {
                    m.Orders.forEach(o => {
                        this.memberOrders.push(new OrderFull(m, o));
                    });
                } else {
                    this.memberOrders.push(new OrderFull(m, null));
                }
            });
        }
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit {
@Input() data: Adherent;
montantC3l: number = 0;
montantClub: number = 0;
montantTotal: number = 0;
  constructor() { }

  ngOnInit(): void {
    if (this.data && this.data.Order) {
        this.montantC3l = this.data.Order.CotisationC3L;
        this.montantTotal = this.data.Order.Total;
        this.montantClub = this.montantTotal - this.montantC3l;
    }
  }

}

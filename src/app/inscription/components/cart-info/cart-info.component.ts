import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Cart } from '@app/inscription/models/cart.model';

@Component({
    selector: 'app-cart-info',
    templateUrl: './cart-info.component.html',
    styleUrls: ['./cart-info.component.scss']
})
export class CartInfoComponent implements OnInit {
    @Input() dark: boolean;
    @Input() cart: Cart;
    @Input() step: number;
    @Input() isMobile: boolean;
    @Output() addMember: EventEmitter<void> = new EventEmitter<void>();
    showPayment = false;

    constructor() { }

    ngOnInit(): void {

    }

    onAddMember() {
        this.addMember.emit();
    }
}

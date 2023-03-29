import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Cart } from '@app/inscription/models/cart.model';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { HelloAssoService } from '@app/inscription/services/helloasso.service';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-cart-info',
    templateUrl: './cart-info.component.html',
    styleUrls: ['./cart-info.component.scss']
})
export class CartInfoComponent implements OnInit {
    @Input() dark: boolean;
    @Input() cart: Cart;
    @Input() step: number;
    @Output() addMember: EventEmitter<void> = new EventEmitter<void>();
    notifier = new Subject<void>();
    showPayment = false;

    constructor(
        private inscriptionService: InscriptionService,
        private modalService: ModalService, 
        private helloasso: HelloAssoService) { }

    ngOnInit(): void {

    }

    onAddMember() {
        this.addMember.emit();
    }

    sendPaymentRequest() {
        // this.helloasso.sendCheckoutIntent(this.cart).then(result => {
        //     console.log('success payment intent: ', result);
        // }).catch(err => {
        //     console.log('error payment intent: ', err);
        // });
    }

    // setShowPayment(): boolean {
    //     let checked = new CheckAdherent();
    //     // let valid = false;
    //     // if (this.cart.client) {
    //     //     checked = this.inscriptionService.checkAdherent(this.cart.client, this.step);
    //     //     valid = checked.valid;
    //     //     if (valid && this.cart.client.Membres?.length) {
    //     //         this.cart.client.Membres.forEach(m => {
    //     //             checked = this.inscriptionService.checkAdherent(m, this.step);
    //     //             if (!checked.valid) {
    //     //                 valid = false;
    //     //             }
    //     //         });
    //     //     }
    //     // }
    //     return this.cart.client && this.step === 3; // && valid;
    // }

    gotoPayment() {
        this.modalService.open({
            title: 'Paiement',
            validateLabel: 'Connexion',
            cancelLabel: 'Mot de passe oublié',
            showCancel: false,
            showValidate: false,
            size: {
                width: '500px',
                height: '800px'
            },
            component: 'payment',
            data: this.cart
        });
        this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                console.log('data received from modal: ', result);
                this.notifier.next();
                this.notifier.complete();
            });
    }
}

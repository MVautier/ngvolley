import { Adherent } from "@app/core/models/adherent.model";
import { environment } from "@env/environment";
import { Cart } from "./cart.model";

export class PaymentRequest {
    totalAmount: number;
    initialAmount: number;
    itemName: string;
    backUrl: string;
    errorUrl: string;
    returnUrl: string;
    containsDonation: boolean;
    terms: terms[];
    payer: payer;
    metadata: any;
    trackingParameter?: string;

    constructor(cart: Cart, basePath: string) {
        this.totalAmount = cart.total * 100;
        this.initialAmount = cart.total * 100;
        this.itemName = environment.helloasso.itemName;
        this.backUrl = basePath + 'inscription?step=4&payment=cancel';
        this.errorUrl = basePath + 'inscription?step=4&payment=error';
        this.returnUrl = basePath + 'inscription?step=4&payment=success';
        this.containsDonation = false;
        // terms sert à la gestion des échéances 
        // this.terms = [];
        // cart.items.forEach(item => {
        //     this.terms.push({
        //         amount: item.montant * 100,
        //         date: new Date()
        //     })
        // });
        this.payer = {
            firstName: cart.client.FirstName,
            lastName: cart.client.LastName,
            email: cart.client.Email,
            dateOfBirth: cart.client.BirthdayDate,
            address: cart.client.Address,
            city: cart.client.City,
            zipCode: cart.client.PostalCode,
            country: 'FRA',
            //companyName: 'CLLL Colomiers'
        }
        this.metadata = cart;
        //this.trackingParameter = 'test'; //cart.client.Uid.substring(0, 10);
    }
}

export class terms {
    amount: number;
    date: Date;
}

export class payer {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    companyName?: string;
}
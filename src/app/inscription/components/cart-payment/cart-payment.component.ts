import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Adherent } from '@app/core/models/adherent.model';
import { Client } from '@app/core/models/client.model';
import { UtilService } from '@app/core/services/util.service';
import { Cart } from '@app/inscription/models/cart.model';
import { HelloAssoService } from '@app/inscription/services/helloasso.service';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { LoaderService } from '@app/ui/layout/services/loader.service';
import { environment } from '@env/environment';

@Component({
    selector: 'app-cart-payment',
    templateUrl: './cart-payment.component.html',
    styleUrls: ['./cart-payment.component.scss']
})
export class CartPaymentComponent implements OnInit {
    @Input() cart: Cart;
    @Input() isMobile: boolean;
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
    formGroup: FormGroup;
    phoneInputMask: string;
    cpInputMask: string;
    adhesionType;
    redirectUrl: string;

    constructor(
        private inscriptionService: InscriptionService,
        private loaderService: LoaderService,
        private formBuilder: FormBuilder,
        private util: UtilService,
        private _adapter: DateAdapter<any>,
        @Inject(MAT_DATE_LOCALE) private _locale: string,
        private helloasso: HelloAssoService) { }

    ngOnInit(): void {
        this.phoneInputMask = this.inscriptionService.phoneInputMask;
        this.cpInputMask = this.inscriptionService.cpInputMask;
        if (this.cart && this.cart.client) {
            this.initForm();
        }
    }

    initForm() {
        this._locale = 'fr';
        this._adapter.setLocale(this._locale);
        const patterns = this.inscriptionService.patterns;
        this.formGroup = this.formBuilder.group({
            'lastname': [this.cart.client.Age >= 18 ? this.cart.client.LastName : null, [Validators.required, CustomValidators.checkName()]],
            'firstname': [this.cart.client.Age >= 18 ? this.cart.client.FirstName : null, [Validators.required, CustomValidators.checkName()]],
            'birthdate': [this.cart.client.Age >= 18 ? this.cart.client.BirthdayDate : null, [Validators.required, CustomValidators.checkAdult()]],
            'address': [this.cart.client.Address, [Validators.required]],
            'postalcode': [this.cart.client.PostalCode, [Validators.required, Validators.pattern(patterns.postalcode.pattern)]],
            'city': [this.cart.client.City, [Validators.required, Validators.pattern(patterns.onlystring.pattern)]],
            'email': [this.cart.client.Age >= 18 ? this.cart.client.Email : null, [Validators.required, Validators.pattern(patterns.email.pattern)]]
        });
    }

    getInputError(field: string) {
        return this.inscriptionService.getInputError(this.formGroup, field);
    }

    getDateError(field: string): string | boolean {
        return this.inscriptionService.getDateError(this.formGroup, field);
    }

    getCpError(field: string) {
        return this.inscriptionService.getCpError(this.formGroup, field, false);
    }

    getClient(): Client {
        const birthDate = this.util.bindDate(this.formGroup.get('birthdate').value);
        const age = Adherent.getAge(birthDate);
        return {
            FirstName: this.formGroup.get('firstname').value,
            LastName: this.formGroup.get('lastname').value,
            BirthdayDate: birthDate,
            Address: this.formGroup.get('address').value,
            PostalCode: this.formGroup.get('postalcode').value,
            City: this.formGroup.get('city').value,
            Email: this.formGroup.get('email').value,
            Age: age
        };
    }

    isFormValid(): boolean {
        const adh = this.getClient();
        return !this.formGroup.invalid && adh?.FirstName !== adh?.LastName;
    }

    onCancel() {
        this.cancel.emit();
    }

    sendCheckout() {
        this.cart.client = this.getClient();
        this.loaderService.setLoading(true);
        this.helloasso.sendCheckoutIntent(this.cart).then(result => {
            console.log('API HelloAsso call succeded: ', result);
            this.cart.client.IdCommand = result.id;
            this.redirectUrl = result.redirectUrl;
            localStorage.setItem('cart', JSON.stringify(this.cart));
            window.location.href = this.redirectUrl;
        }).catch(err => {
            console.log('API HelloAsso call error : ', err);
        }).finally(() => {
            this.loaderService.setLoading(false);
        });
    }

    onValidate() {

    }
}

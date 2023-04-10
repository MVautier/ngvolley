import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { HttpDataService } from '@app/core/services/http-data.service';
import { HelloassoToken } from '../../authentication/models/helloasso-token.model';
import { Cart } from '../models/cart.model';
import { PaymentRequest } from '../models/payment-request.model';
import { CheckoutIntentResult } from '../models/checkout-intent-result.model';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';

@Injectable()
export class PhotoService {

    private isMobile = false;
    subModal: Subscription;
    notifier = new Subject<void>();
    public imageBase64: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(private modalService: ModalService) {
        if (window.matchMedia('(max-width: 1025px)').matches) {
            this.isMobile = true;
        }
    }

    showModal(mode: string) {
        if (this.subModal) {
            this.subModal.unsubscribe();
        }
        this.modalService.open({
            title: mode === 'camera' ? 'Prendre une photo' : 'Recadrer la photo',
            validateLabel: 'Valider',
            cancelLabel: 'Annuler',
            showCancel: true,
            showValidate: true,
            size: {
                width: this.isMobile ? '100%' : '640px',
                height: mode === 'cropper' ? '390px' : (this.isMobile ? '390px' : '665px')
            },
            component: mode,
            data: mode === 'cropper' ? this.imageBase64 : null
        });
        this.subModal = this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                console.log('data received from modal: ', result);
                if (result?.data) {
                    this.imageBase64.next(result.data);
                    //this.photo.emit(this.imageBase64);
                    this.notifier.next();
                    this.notifier.complete();
                }
            });
    }

    public getBase64(file): Promise<string> {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result.toString());
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }
}
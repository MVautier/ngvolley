import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-cart-payment',
  templateUrl: './cart-payment.component.html',
  styleUrls: ['./cart-payment.component.scss']
})
export class CartPaymentComponent implements OnInit, AfterViewInit {
    config: ModalConfig;
    validate: (result: ModalResult) => {};
    cancel: (result: ModalResult) => {};


  constructor() { }

  ngOnInit(): void {
    if (this.config) {
        console.log('current cart: ', this.config.data);
    } else {
        console.log('no data provided');
    }
    
  }

  ngAfterViewInit(): void {
    const iframe = document.querySelector('#haWidget') as HTMLIFrameElement;
    if (iframe) {
        iframe.onload = () => {
            console.log('payment iframe loaded');
            //this.fillForm(iframe);
        }
        iframe.onerror = (err) => {
            console.log('error loading payment iframe: ', err);
        }
        iframe.src = environment.helloasso.iframeUrl + '?lastname=' + this.config.data.client.LastName;
    }
  }

  fillForm(ifrm: HTMLIFrameElement) {
    const client = this.config.data?.client as Adherent;
    if (client) {
        this.fillField(ifrm, 'lastname', client.LastName);
    }
  }

  fillField(ifrm: HTMLIFrameElement, id: string, value: string) {
    const input = ifrm.querySelector('#' + id) as HTMLInputElement;
    if (input) {
        input.value = value;
    }
  }

}

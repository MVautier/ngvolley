import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { HttpDataService } from '@app/core/services/http-data.service';
import { Cart } from '../models/cart.model';
import { CheckoutIntentResult } from '../models/checkout-intent-result.model';

@Injectable()
export class HelloAssoService {

  constructor(private http: HttpDataService<any>, private ssrService: SsrService) {

  }

  sendCheckoutIntent(cart: Cart): Promise<CheckoutIntentResult> {
    return new Promise((resolve, reject) => {
      this.http.post<Cart>(environment.apiUrl + 'Helloasso/initiate', cart).then((result: CheckoutIntentResult) => {
        resolve(result);
      }).catch(err => {
        reject('error sendCheckoutIntent: ' + err.message);
      });
    });
  }

  getCheckoutIntent(intentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(environment.apiUrl + 'Helloasso/receipt/' + intentId).then((result: any) => {
        resolve(result);
      }).catch(err => {
        reject('error getCheckoutIntent: ' + err.message);
      });
    });
  }
}
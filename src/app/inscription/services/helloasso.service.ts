import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { HttpDataService } from '@app/core/services/http-data.service';
import { HelloassoToken } from '../../authentication/models/helloasso-token.model';
import { Cart } from '../models/cart.model';
import { PaymentRequest } from '../models/payment-request.model';
import { CheckoutIntentResult } from '../models/checkout-intent-result.model';

@Injectable()
export class HelloAssoService {

  // apiAuth = environment.helloasso.authServer;
  // apiUrl = environment.helloasso.apiServer;
  // private _token: HelloassoToken;
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

  // sendCheckoutIntent(cart: Cart): Promise<CheckoutIntentResult> {
  //   return new Promise((resolve, reject) => {
  //     this.token().then(res => {
  //       cart.token = res.access_token;
  //       this.http.post<Cart>(environment.apiUrl + 'Helloasso/initiate', cart).then((result: CheckoutIntentResult) => {
  //         resolve(result);
  //       }).catch(err => {
  //         reject('error sendCheckoutIntent: ' + err.message);
  //       });
  //     }).catch(err => {
  //       reject('error token: ' + err.message);
  //     });
  //   });
  // }

  // getCheckoutIntent(intentId: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.token().then(res => {
  //       this.http.post<any>(environment.apiUrl + 'Helloasso/receipt/' + intentId, res).then((result: any) => {
  //         resolve(result);
  //       }).catch(err => {
  //         reject('error getCheckoutIntent: ' + err.message);
  //       });
  //     }).catch(err => {
  //       reject('error token: ' + err.message);
  //     });

  //   });
  // }

  // public token(): Promise<HelloassoToken> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   });
  //   const options = { headers: headers };
  //   const body = new URLSearchParams();
  //   body.set('client_id', environment.helloasso.clienId);
  //   body.set('client_secret', environment.helloasso.clientSecret);
  //   body.set('grant_type', 'client_credentials');
  //   return this.http.post<any>(this.apiAuth + '/token', body, options);
  // }

  // private refresh(refresh_token: string): Promise<HelloassoToken> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   });
  //   const options = { headers: headers };
  //   const body = new URLSearchParams();
  //   body.set('client_id', environment.helloasso.clienId);
  //   body.set('refresh_token', refresh_token);
  //   body.set('grant_type', 'refresh_token');
  //   return this.http.post<any>(this.apiAuth + '/token', body, options);
  // }

  // private getToken(): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     if (this._token) {
  //       if (!this.isExpired(this._token)) {
  //         resolve(this._token.access_token);
  //       } else {
  //         this.refresh(this._token.refresh_token).then(token => {
  //           this._token = this.renew(token);
  //           resolve(this._token.access_token);
  //         }).catch(err => {
  //           reject('error refreshing token: ' + err.message);
  //         });
  //       }
  //     } else {
  //       this.token().then(token => {
  //         this._token = this.renew(token);
  //         resolve(this._token.access_token);
  //       }).catch(err => {
  //         reject('error getting token: ' + err.message);
  //       });
  //     }
  //   });
  // }

  // private renew(token: any): HelloassoToken {
  //   const now = new Date();
  //   const expire = new Date(now);
  //   expire.setMinutes(now.getMinutes() + 30);
  //   return {
  //     access_token: token.access_token,
  //     refresh_token: token.refresh_token,
  //     expires_in: expire,
  //     token_type: token.token_type
  //   };
  // }

  // private isExpired(token: HelloassoToken): boolean {
  //   return new Date().getTime() > token.expires_in.getTime();
  // }
}
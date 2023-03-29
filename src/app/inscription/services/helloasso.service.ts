import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { HttpDataService } from '@app/core/services/http-data.service';
import { HelloassoToken } from '../../authentication/models/helloasso-token.model';
import { Adherent } from '@app/core/models/adherent.model';
import { Cart } from '../models/cart.model';
import { PaymentRequest } from '../models/payment-request.model';

@Injectable()
export class HelloAssoService {

    apiAuth = environment.helloasso.authServer;
    apiUrl = environment.helloasso.apiServer;
    constructor(private http: HttpDataService<any>, private ssrService: SsrService) {

    }

    token(): Promise<HelloassoToken> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        const options = { headers: headers };
        const body = new URLSearchParams();
        body.set('client_id', environment.helloasso.clienId);
        body.set('client_secret', environment.helloasso.clientSecret);
        body.set('grant_type', 'client_credentials');
        return this.http.post<any>(this.apiAuth + '/token', body, options);
    }

    refresh(refresh_token: string): Promise<HelloassoToken> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        const options = { headers: headers };
        const body = new URLSearchParams();
        body.set('client_id', environment.helloasso.clienId);
        body.set('refresh_token', refresh_token);
        body.set('grant_type', 'refresh_token');
        return this.http.post<any>(this.apiAuth + '/token', body, options);
    }

    sendCheckoutIntent(cart: Cart): Promise<any> {
        return new Promise((resolve, reject) => {
            this.token().then(token => {
                console.log('success auth to helloasso: ', token);
                const baseUrl = this.ssrService.isServer() ? environment.basePathSsr : environment.basePath;
                const body = new PaymentRequest(cart, baseUrl);
                console.log('intent body: ', body);
                const url = environment.helloasso.apiServer + '/organizations/' + environment.helloasso.organizationSlug + '/checkout-intents';
                const headers = new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token.access_token
                });
                resolve(this.http.post<any>(url, body, {headers}));
            }).catch(err => {
                reject('error: ' + err.message);
            });
        });
    }
}
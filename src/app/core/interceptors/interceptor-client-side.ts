import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CustomError } from '@app/core/models/custom-error.model';
import { TransferStateService } from '@app/core/services/transfert-state.service';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { environment } from '@env/environment';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { UserToken } from '../../authentication/models/user-token.model';
import { AuthorizeApiService } from '../../authentication/services/authorize-api.service';
import { ConnectionInfoService } from '../../authentication/services/connexion-info.service';
import { LoginService } from '../../authentication/services/login.service';
//import { SharedAuthenticationService } from '../services/shared-authentication.service';
// import { SharedAuthenticationUIService } from '../services/shared-authenticationUI.service';
// import { sharedConnectionInfoService } from '../services/shared-connection-info.service';

@Injectable()
export class InterceptorClientSide implements HttpInterceptor {
  constructor(
    private authService: AuthorizeApiService,
    private transferState: TransferStateService,
    private connexionInfo: ConnectionInfoService,
    private ssrService: SsrService,
    private login: LoginService,
    private router: Router,
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const errorKey = makeStateKey<any>('CUSTOM_ERRORS');
    // if(this.ssrService.isServer()) {
    //   this.transferState.set(errorKey, [...[{
    //     url: request.url,
    //     status: 404,
    //     message: 'client interceptor - not found in server side'
    //   }]]);
    // } else {
    //   this.transferState.get(errorKey, [...[{
    //     url: request.url,
    //     status: 404,
    //     message: 'client interceptor - not found in client side'
    //   }]]);
    // }

    if (request.url.includes('ping')) {
      const blocName = 'ping';
      const blockKey = makeStateKey<any>(blocName);
      const blockValue = this.transferState.get(blockKey, null);
      if (blockValue) {
        console.log('value for ', blocName, ' was in viewState');
        const response = new HttpResponse({ body: JSON.parse(decodeURIComponent(escape(atob(blockValue)))), status: 200 });
        return of(response);
      } else {
        console.log('value for ', blocName, ' was not in viewState');
        //console.log('========== call cms in client side: ', req.url);
        return next.handle(request).pipe(
            tap(event => {
                if ((event instanceof HttpResponse && (event.status === 200))) {
                  if (request.url.includes('ping')) {
                        this.transferState.set(blockKey, btoa(unescape(encodeURIComponent(JSON.stringify(event.body)))))
                    }
                }
            }),
            catchError(error => {
                throw error;
            })
        );
      }
    }

    if (!this.connexionInfo.Token) {
      this.connexionInfo.Token = this.authService.GetTokenByCookie();
    }

    return next.handle(this.applyCredentials(request)).pipe(
      catchError((err) => {
        if (err.status === 0) {
          throw err;
        }
        if (!this.isAuthError(err)) {
          if (err.error && err.error.msg && err.error.status) {
            return next.handle(request);
          }

          //
          throw err;
        }
        if (err instanceof HttpErrorResponse && err.url === environment.apiUrl) {
          //
          throw err;
        }

        if (
          this.connexionInfo.Token 
          && new Date((this.connexionInfo.Token as UserToken).expire_in) > new Date() 
          && !request.url.includes('/geolocation-db.com') 
          && !request.url.endsWith('/token') 
          && !request.url.endsWith('/login')) {
          return from(this.authService.RefreshToken((this.connexionInfo.Token as UserToken).refresh_token)).pipe(switchMap(t => {
            if (t) {
              return next.handle(this.applyCredentials(request));
            }
            else {

              return from(this.login.showAuthenticationForm(0)).pipe(switchMap(t => {
                if (t) {
                  return next.handle(this.applyCredentials(request));
                }
                else {
                  throw err;
                }
              }));
            }
          }));
        }

        if (err instanceof HttpErrorResponse) {
          //
        }

        this.authService.LogOut();
        throw err;
      }) as any);

  }

  private isAuthError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 401 || error instanceof HttpErrorResponse && error.status === 500 && error.error === "Le token n'est pas valide";
  }


  applyCredentials(request: HttpRequest<any>): HttpRequest<any> {
    if (!this.connexionInfo.Token || !this.connexionInfo.Token.id_token) {
      return request;
    }

    if (request.body && request.body.toString() === '[object FormData]') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.connexionInfo.Token.id_token}`
        },
      });
    } else if (!request.url.includes('/geolocation-db.com')) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.connexionInfo.Token.id_token}`
        },
      });
    }

    return request;
  }
}

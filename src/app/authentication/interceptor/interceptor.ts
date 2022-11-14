import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Observable, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserToken } from '../models/user-token.model';
import { AuthorizeApiService } from '../services/authorize-api.service';
import { ConnectionInfoService } from '../services/connexion-info.service';
import { LoginService } from '../services/login.service';
//import { SharedAuthenticationService } from '../services/shared-authentication.service';
// import { SharedAuthenticationUIService } from '../services/shared-authenticationUI.service';
// import { sharedConnectionInfoService } from '../services/shared-connection-info.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(
    private authService: AuthorizeApiService,
    private connexionInfo: ConnectionInfoService,
    private login: LoginService,
    private router: Router,
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

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

        if (this.connexionInfo.Token && new Date((this.connexionInfo.Token as UserToken).expire_in) > new Date() && !request.url.endsWith('/token') && !request.url.endsWith('/login')) {
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
    } else {
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Login } from '../models/login.model';
import { UserToken } from '../models/user-token.model';
import { Refresh } from '../models/refresh.model';
import { CookieService } from './cookie.service';
import { User } from '../models/user.model';
import { ConnectionInfoService } from './connexion-info.service';

@Injectable()
export class AuthorizeApiService {
    constructor(
        private httpClient: HttpClient, 
        private connexionInfo: ConnectionInfoService,
        private cookieService: CookieService) { }

    // créé le token + token_refresh (stocké en base)
    Authorize(login: Login): Promise<UserToken> {
      return this.httpClient
        .post<UserToken>(environment.apiUrl + '/login', login)
        .toPromise();
    }

    public IsLogged(): Promise<boolean> {
        return this.CheckToken();
      }
    
    Login(login: Login): Promise<void> {
        return this.Authorize(login).then((us) => {
            this.AssignToken(us);
            return;
        });
    }
  
    // suppr le refresh_token en base
    LogOut(): Promise<void> {
      return this.httpClient
        .delete<void>(environment.apiUrl + '/logout')
        .toPromise();
    }

    CheckToken(): Promise<boolean> {
        const user = this.GetTokenByCookie();
        if (!user || !user.id_token) {
          this.connexionInfo.SetNewConnexionState(new UserToken());
          this.FinalyseConnexionInfo(null);
          return Promise.resolve(false);
        }
    
        if (user && user.id_token !== '') {
          if (!this.connexionInfo.UserInfo) {
            this.AssignToken(user);
            this.connexionInfo.SetNewConnexionState(user);
          }
          return Promise.resolve(true);
        }
    
        if (user && user.refresh_token !== '' && new Date(user.expire_in) > new Date()) {
          return this.RefreshToken(user.refresh_token) as any;
        }
    
        this.connexionInfo.SetNewConnexionState(new UserToken());
        this.FinalyseConnexionInfo(null);
        return Promise.resolve(false);
    }

    public GetTokenByCookie(): UserToken | null {
        const cookie = this.cookieService.Get(environment.cookieName);
    
        if (cookie != null && cookie !== '') {
          const result = JSON.parse(cookie);
    
          var usrToken = {
            IdUser: result.IdUser,
            id_token: result.id_token,
            refresh_token: result.refresh_token,
            expire_in: result.expire_in
          };
        }
    
        if (usrToken) {
          return usrToken;
        }
    
        return null;
    }
  
    // détruit le refresh donné en entrée et en créé un nouveau + token (comme login)
    GetTokenByRefresh(refreshToken: string): Promise<UserToken> {
      const refresh: Refresh = {
        ClientID: null,
        RefreshToken: refreshToken,
      };
      return this.httpClient
        .post<UserToken>(environment.apiUrl + '/token', refresh, {})
        .toPromise();
    }

    RefreshToken(refresh_token: string): Promise<boolean | null> {
        return new Promise((resolve) => {
          this.GetTokenByRefresh(refresh_token).then((token) => {
            if (token.id_token !== '') {
              this.connexionInfo.SetNewConnexionState(token);
              this.AssignToken(token);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
    }

    private AssignToken(user: UserToken): void {
        this.connexionInfo.SetNewConnexionState(user);
        if (user.id_token) {
            this.SetUserInfo(user.id_token);
        } else {
            this.FinalyseConnexionInfo(null);
        }
        this.AssignCookie(user);
    }

    public SetUserInfo(token: string): void {
        try {
            const jwt: any = JSON.parse(atob(token.split('.')[1]));
            const user: User = {
              ExpireDate: jwt.value.ExpireDate,
              IdUser: jwt.value.IdUser,
              Mail: jwt.value.Mail,
              FirstName: jwt.value.FirstName,
              LastName: jwt.value.LastName
            };
            if (!jwt.value.HasActiveAccount) {
              this.connexionInfo.SetNewConnexionState(null);
              this.FinalyseConnexionInfo(null);
            } else {
              this.FinalyseConnexionInfo(user);
            }
          } catch (ex) {
            this.connexionInfo.SetNewConnexionState(null);
            this.FinalyseConnexionInfo(null);
          }
    }
    
    private AssignCookie(userToken: UserToken): void {
        this.cookieService.Set(
          environment.cookieName,
          JSON.stringify(userToken),
          Date.now() + 259200000, // 3 day
          environment.cookiePath,
          environment.cookieDomain,
          environment.isSecure
        );
    }

    private FinalyseConnexionInfo(user: User | null): void {
        this.connexionInfo.SetClientInfo(user as User);
        this.connexionInfo.TriggerConnexionChange();
      }
}
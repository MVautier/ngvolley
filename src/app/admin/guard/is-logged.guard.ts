import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';

@Injectable()
export class IsLoggedGuard implements CanActivate {

    constructor(
        public router: Router, 
        private connexionInfo: ConnectionInfoService,
        private authService: AuthorizeApiService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.authService.CheckToken().then(logged => {
                let ok = logged;
                this.connexionInfo.GetOnChangeConnexion().subscribe(token => {
                  ok = this.connexionInfo.IsAuth();
                  if (ok) {
                    resolve(true);
                  } else {
                    resolve(false);
                    this.router.navigate(['home']);
                  }
                });
            });
        });
    }
}

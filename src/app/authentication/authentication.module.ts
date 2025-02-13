import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthorizeApiService } from './services/authorize-api.service';
import { ConnectionInfoService } from './services/connexion-info.service';
import { CookieService } from './services/cookie.service';
import { LoginService } from './services/login.service';
import { FormsModule } from '@angular/forms';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { LoginComponent } from './components/login/login.component';

@NgModule({ declarations: [
        LoginComponent
    ],
    exports: [], imports: [CommonModule,
        FormsModule,
        MaterialThemeModule], providers: [
        AuthorizeApiService,
        ConnectionInfoService,
        CookieService,
        LoginService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AuthenticationModule {
  static forRoot(): ModuleWithProviders<AuthenticationModule> {
    return {
      ngModule: AuthenticationModule,
      providers: [
        AuthorizeApiService,
        ConnectionInfoService,
        CookieService,
        LoginService
      ],
    };
  }
}

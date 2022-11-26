import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptor/interceptor';
import { AuthorizeApiService } from './services/authorize-api.service';
import { ConnectionInfoService } from './services/connexion-info.service';
import { CookieService } from './services/cookie.service';
import { LoginService } from './services/login.service';
import { ModalLoginComponent } from './components/modal-login/modal-login.component';
import { FormsModule } from '@angular/forms';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';

@NgModule({
  declarations: [
  
    ModalLoginComponent
  ],
  providers: [
    AuthorizeApiService,
    ConnectionInfoService,
    CookieService,
    LoginService
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialThemeModule,
    HttpClientModule
  ],
  exports: [

  ]
})
export class AuthenticationModule {
  static forRoot(): ModuleWithProviders<AuthenticationModule> {
    return {
      ngModule: AuthenticationModule,
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true},
        AuthorizeApiService,
        ConnectionInfoService,
        CookieService,
        LoginService
      ],
    };
  }
}

import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptor/interceptor';
import { AuthorizeApiService } from './services/authorize-api.service';
import { ConnectionInfoService } from './services/connexion-info.service';
import { CookieService } from './services/cookie.service';
import { LoginService } from './services/login.service';

@NgModule({
  declarations: [
  ],
  providers: [
    AuthorizeApiService,
    ConnectionInfoService,
    CookieService,
    LoginService
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [

  ]
})
export class SharedAuthenticationModule {
  static forRoot(): ModuleWithProviders<SharedAuthenticationModule> {
    return {
      ngModule: SharedAuthenticationModule,
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

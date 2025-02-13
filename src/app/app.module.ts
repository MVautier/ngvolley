import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
//import { SwiperModule } from 'swiper/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LayoutModule } from './ui/layout/layout.module';
import { SsrService } from './ui/layout/services/ssr.service';
import { InterceptorClientSide } from './core/interceptors/interceptor-client-side';
//import { NgxMaskModule, IConfig } from 'ngx-mask';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFr);
@NgModule({ declarations: [
        AppComponent
    ],
    exports: [LayoutModule],
    bootstrap: [AppComponent], imports: [BrowserModule.withServerTransition({ appId: 'colomiers-volley' }),
        BrowserAnimationsModule,
        AppRoutingModule,
        FontAwesomeModule,
        CoreModule.forRoot(),
        LayoutModule.forRoot(),
        //NgxMaskModule.forRoot(),
        SwiperModule], providers: [
        SsrService,
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorClientSide, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}

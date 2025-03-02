import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AdherentService } from '@app/core/services/adherent.service';
import { HrefToRouterLinkDirective } from './directives/href-to-routerlink.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AdminService } from './services/admin.service';
import { ApiPingService } from './services/api-ping.service';
import { HttpDataService } from './services/http-data.service';
import { PdfMakerService } from './services/pdf-maker.service';
import { RegexShared } from './services/regex-shared';
import { RouteService } from './services/route.services';
import { ThemeService } from './services/theme.service';
import { WindowStateService } from './services/window-state.service';
import { UtilService } from './services/util.service';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InscriptionService } from '@app/inscription/services/inscription.service';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    HrefToRouterLinkDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  exports: [
    SafeHtmlPipe,
    HrefToRouterLinkDirective
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        RegexShared,
        WindowStateService,
        HttpDataService,
        ApiPingService,
        RouteService,
        ThemeService,
        AdminService,
        SafeHtmlPipe,
        DatePipe,
        CurrencyPipe,
        DecimalPipe,
        HrefToRouterLinkDirective,
        AdherentService,
        AdherentAdminService,
        PdfMakerService,
        UtilService,
        InscriptionService
      ]
    };
  }
}
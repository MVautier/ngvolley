import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AdherentService } from '@app/core/services/adherent.service';
import { HrefToRouterLinkDirective } from './directives/href-to-routerlink.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AdminService } from './services/admin.service';
import { ApiPingService } from './services/api-ping.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { HttpDataService } from './services/http-data.service';
import { PdfMakerService } from './services/pdf-maker.service';
import { RegexShared } from './services/regex-shared';
import { RouteService } from './services/route.services';
import { ThemeService } from './services/theme.service';
import { TransferStateService } from './services/transfert-state.service';
import { WindowStateService } from './services/window-state.service';

@NgModule({
    declarations: [
      SafeHtmlPipe,
      HrefToRouterLinkDirective
    ],
    imports: [
      CommonModule
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
          HrefToRouterLinkDirective,
          ErrorHandlerService,
          TransferStateService,
          AdherentService,
          PdfMakerService
        ]
      };
    }
  }
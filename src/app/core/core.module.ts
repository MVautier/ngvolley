import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HrefToRouterLinkDirective } from './directives/href-to-routerlink.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AdminService } from './services/admin.service';
import { ApiPingService } from './services/api-ping.service';
import { HttpDataService } from './services/http-data.service';
import { RegexShared } from './services/regex-shared';
import { RouteService } from './services/route.services';
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
          AdminService,
          SafeHtmlPipe,
          HrefToRouterLinkDirective
        ]
      };
    }
  }
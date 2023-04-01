import { ModuleWithProviders, NgModule } from "@angular/core";
import { MainComponent } from './pages/main/main.component';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SliderService } from "./services/slider.service";
import { RouterModule } from "@angular/router";
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { AuthenticationModule } from "@app/authentication/authentication.module";
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TileComponent } from './components/tile/tile.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MaterialThemeModule } from "@app/material-theme/material-theme.module";
import { CenterComponent } from './components/center/center.component';
import { PageComponent } from "@app/ui/layout/components/page/page.component";
import { ModalComponent } from './components/modal/modal.component';
import { SafeHtmlPipe } from "@app/core/pipes/safe-html.pipe";
import { CoreModule } from "@app/core/core.module";
import { CustomErrorComponent } from './components/custom-error/custom-error.component';
import { LayoutService } from "./services/layout.service";
import { ModalService } from "./services/modal.service";
import { DynamicDirective } from "./directives/dynamic.directive";
import { InscriptionService } from "@app/inscription/services/inscription.service";
import { LoaderService } from "./services/loader.service";
import { LoaderComponent } from "./components/loader/loader.component";

@NgModule({


  declarations: [
    MainComponent,
    MainMenuComponent,
    TileComponent,
    ToolbarComponent,
    CenterComponent,
    PageComponent,
    ModalComponent,
    CustomErrorComponent,
    DynamicDirective,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialThemeModule,
    CoreModule,
    RouterModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    AuthenticationModule.forRoot()
  ],
  exports: [
    TileComponent,
    MaterialThemeModule,
    ModalComponent,
    CustomErrorComponent,
    LoaderComponent
  ]
})
export class LayoutModule {
    static forRoot(): ModuleWithProviders<LayoutModule> {
      return {
        ngModule: LayoutModule,
        providers: [
          SliderService,
          BsModalService,
          LayoutService,
          ModalService,
          InscriptionService,
          LoaderService
        ]
      };
    }
}
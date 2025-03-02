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
import { MaterialThemeModule } from "@app/material-theme/material-theme.module";
import { CenterComponent } from './components/center/center.component';
import { PageComponent } from "@app/ui/layout/components/page/page.component";
import { ModalComponent } from './components/modal/modal.component';
import { CoreModule } from "@app/core/core.module";
import { LayoutService } from "./services/layout.service";
import { ModalService } from "./services/modal.service";
import { DynamicDirective } from "./directives/dynamic.directive";
import { LoaderService } from "./services/loader.service";
import { LoaderComponent } from "./components/loader/loader.component";

@NgModule({


  declarations: [
    MainComponent,
    MainMenuComponent,
    TileComponent,
    CenterComponent,
    PageComponent,
    ModalComponent,
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
    MainComponent,
    TileComponent,
    MaterialThemeModule,
    ModalComponent,
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
        LoaderService
      ]
    };
  }
}
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
import { ThemeService } from "./services/theme.service";
import { TileComponent } from './components/tile/tile.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MaterialThemeModule } from "@app/material-theme/material-theme.module";
import { CenterComponent } from './components/center/center.component';

@NgModule({


  declarations: [
    MainComponent,
    MainMenuComponent,
    TileComponent,
    ToolbarComponent,
    CenterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialThemeModule,
    RouterModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    AuthenticationModule.forRoot()
  ],
  providers: [
    
  ],
  exports: [
    TileComponent,
    MaterialThemeModule
  ]
})
export class LayoutModule {
    static forRoot(): ModuleWithProviders<LayoutModule> {
      return {
        ngModule: LayoutModule,
        providers: [
          SliderService,
          BsModalService,
          ThemeService
        ]
      };
    }
}
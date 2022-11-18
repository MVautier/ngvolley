import { ModuleWithProviders, NgModule } from "@angular/core";
import { MainComponent } from './pages/main/main.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuMobileComponent } from './components/menu-mobile/menu-mobile.component';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SliderService } from "./services/slider.service";
import { RouterModule } from "@angular/router";
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { PreHeaderComponent } from './components/pre-header/pre-header.component';
import { AuthenticationModule } from "@app/authentication/authentication.module";
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({


  declarations: [
    MainComponent,
    HeaderComponent,
    MenuMobileComponent,
    MainMenuComponent,
    PreHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    AuthenticationModule.forRoot()
  ],
  providers: [
    SliderService,
    BsModalService
  ]
})
export class LayoutModule {
    static forRoot(): ModuleWithProviders<LayoutModule> {
      return {
        ngModule: LayoutModule
      };
    }
}
import { ModuleWithProviders, NgModule } from "@angular/core";
import { MainComponent } from './pages/main/main.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuMobileComponent } from './components/menu-mobile/menu-mobile.component';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CoreModule } from "@app/core/core.module";
import { SliderService } from "../services/slider.service";
import { RouterModule } from "@angular/router";
import { CenterComponent } from './components/center/center.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { PreHeaderComponent } from './components/pre-header/pre-header.component';
import { AuthenticationModule } from "@app/authentication/authentication.module";
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';

@NgModule({


  declarations: [
    MainComponent,
    HeaderComponent,
    MenuMobileComponent,
    CenterComponent,
    MainMenuComponent,
    PreHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ModalModule.forRoot(),
    AuthenticationModule.forRoot(),
    CoreModule.forRoot()
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
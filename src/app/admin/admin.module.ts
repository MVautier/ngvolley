import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { LayoutService } from './services/layout.service';
import { IsLoggedGuard } from './guard/is-logged.guard';
import { ClickOutsideModule } from 'ng-click-outside';



@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    ClickOutsideModule,
    AdminRoutingModule
  ],
  providers: [
    IsLoggedGuard,
    LayoutService
  ]
})
export class AdminModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { LayoutService } from './services/layout.service';
import { CoreModule } from '@app/core/core.module';



@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    AdminRoutingModule
  ],
  providers: [
    LayoutService
  ]
})
export class AdminModule { }

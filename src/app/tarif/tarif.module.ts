import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TarifRoutingModule } from './tarif-routing.module';
import { TarifPageComponent } from './pages/tarif-page/tarif-page.component';


@NgModule({
  declarations: [
    TarifPageComponent
  ],
  imports: [
    CommonModule,
    TarifRoutingModule
  ]
})
export class TarifModule { }

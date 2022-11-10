import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InscriptionRoutingModule } from './inscription-routing.module';
import { InscriptionPageComponent } from './pages/inscription-page/inscription-page.component';


@NgModule({
  declarations: [
    InscriptionPageComponent
  ],
  imports: [
    CommonModule,
    InscriptionRoutingModule
  ]
})
export class InscriptionModule { }

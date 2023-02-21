import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InscriptionRoutingModule } from './inscription-routing.module';
import { InscriptionPageComponent } from './pages/inscription-page/inscription-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { MatNativeDateModule } from '@angular/material/core';


@NgModule({
  declarations: [
    InscriptionPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialThemeModule,
    MatNativeDateModule,
    InscriptionRoutingModule
  ]
})
export class InscriptionModule { }

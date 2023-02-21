import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InscriptionRoutingModule } from './inscription-routing.module';
import { InscriptionPageComponent } from './pages/inscription-page/inscription-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
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
    MatAutocompleteModule,
    NgxMaskModule,
    InscriptionRoutingModule
  ]
})
export class InscriptionModule { }

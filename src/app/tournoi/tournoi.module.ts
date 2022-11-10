import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournoiRoutingModule } from './tournoi-routing.module';
import { TournoiPageComponent } from './pages/tournoi-page/tournoi-page.component';


@NgModule({
  declarations: [
    TournoiPageComponent
  ],
  imports: [
    CommonModule,
    TournoiRoutingModule
  ]
})
export class TournoiModule { }

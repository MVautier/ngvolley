import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClubRoutingModule } from './club-routing.module';
import { ClubPageComponent } from './pages/club-page/club-page.component';


@NgModule({
  declarations: [
    ClubPageComponent
  ],
  imports: [
    CommonModule,
    ClubRoutingModule
  ]
})
export class ClubModule { }

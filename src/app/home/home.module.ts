import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { SwiperModule } from 'swiper/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LayoutModule } from '@app/ui/layout/layout.module';


@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    HomeRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    SwiperModule
  ]
})
export class HomeModule { }

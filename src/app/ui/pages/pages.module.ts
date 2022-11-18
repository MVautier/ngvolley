import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PagesRoutingModule } from './pages-routing.module';
import { GestionPageComponent } from './pages/gestion-page/gestion-page.component';
import { PageCardComponent } from './components/page-card/page-card.component';


@NgModule({
  declarations: [
    GestionPageComponent,
    PageCardComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }

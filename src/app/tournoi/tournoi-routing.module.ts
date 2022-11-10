import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TournoiPageComponent } from './pages/tournoi-page/tournoi-page.component';

const routes: Routes = [
  { path: '', component: TournoiPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournoiRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TarifPageComponent } from './pages/tarif-page/tarif-page.component';

const routes: Routes = [
  { path: '', component: TarifPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TarifRoutingModule { }

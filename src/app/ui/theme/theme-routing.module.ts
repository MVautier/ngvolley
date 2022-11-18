import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThemePageComponent } from './pages/theme-page/theme-page.component';

const routes: Routes = [{ path: '', component: ThemePageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemeRoutingModule { }

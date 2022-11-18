import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaPageComponent } from './pages/media-page/media-page.component';

const routes: Routes = [
  { path: '', component: MediaPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaRoutingModule { }

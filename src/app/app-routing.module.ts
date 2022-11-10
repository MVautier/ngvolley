import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './ui/layout/pages/main/main.component';

const routes: Routes = [
  { path: '', component: MainComponent, children: [
    { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    { path: 'club', loadChildren: () => import('./club/club.module').then(m => m.ClubModule) },
    { path: 'tarif', loadChildren: () => import('./tarif/tarif.module').then(m => m.TarifModule) },
    { path: 'tournoi', loadChildren: () => import('./tournoi/tournoi.module').then(m => m.TournoiModule) },
    { path: 'inscription', loadChildren: () => import('./inscription/inscription.module').then(m => m.InscriptionModule) },
    { path: 'contact', loadChildren: () => import('./contact/contact.module').then(m => m.ContactModule) },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    
  ] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './ui/layout/pages/main/main.component';

const routes: Routes = [
  { path: '', component: MainComponent, children: [
    { path: 'home', title: 'Accueil', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    { path: 'page', loadChildren: () => import('./page/page.module').then(m => m.PageModule) },
    { path: 'inscription', title: 'Inscription', loadChildren: () => import('./inscription/inscription.module').then(m => m.InscriptionModule) },
    { path: 'admin', title: 'Administration', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
    //{ path: 'tarif', loadChildren: () => import('./tarif/tarif.module').then(m => m.TarifModule) },
    //{ path: 'tournoi', loadChildren: () => import('./tournoi/tournoi.module').then(m => m.TournoiModule) },
    //{ path: 'contact', loadChildren: () => import('./contact/contact.module').then(m => m.ContactModule) }
  ] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

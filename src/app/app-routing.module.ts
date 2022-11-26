import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './ui/layout/components/page/page.component';
import { MainComponent } from './ui/layout/pages/main/main.component';

const routes: Routes = [
  { path: '', component: MainComponent, children: [
    { path: 'home', title: 'Accueil', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    { path: 'inscription', title: 'Inscription', loadChildren: () => import('./inscription/inscription.module').then(m => m.InscriptionModule) },
    { path: 'admin', title: 'Administration', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: ':page', component: PageComponent },
    { path: '**', redirectTo: 'home'}
  ] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

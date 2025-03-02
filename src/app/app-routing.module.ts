import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './ui/layout/components/page/page.component';
import { MainComponent } from './ui/layout/pages/main/main.component';
import { environment } from '@env/environment';

let routes: Routes = [];

if (environment.fullApp) {
  routes = [
    {
      path: '', component: MainComponent, children: [
        { path: 'home', title: 'Accueil', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
        { path: 'inscription', title: 'Inscription', loadChildren: () => import('./inscription/inscription.module').then(m => m.InscriptionModule) },
        { path: 'admin', title: 'Administration', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
        { path: 'page/:page', component: PageComponent },
        //{ path: 'error', component: CustomErrorComponent },
        { path: '**', redirectTo: 'home' }
      ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
  ];

} else {
  routes = [
    { path: '', title: 'Inscription', loadChildren: () => import('./inscription/inscription.module').then(m => m.InscriptionModule) },
    { path: 'admin', title: 'Administration', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: '**', redirectTo: 'inscription' },
    { path: '**', redirectTo: '' }
  ];
}

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

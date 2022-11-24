import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemEditComponent } from './components/item-edit/item-edit.component';
import { IsLoggedGuard } from './guard/is-logged.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { CommentsPageComponent } from './pages/comments-page/comments-page.component';
import { GestionPageComponent } from './pages/gestion-page/gestion-page.component';
import { MediaPageComponent } from './pages/media-page/media-page.component';
import { PostsPageComponent } from './pages/posts-page/posts-page.component';
import { ThemePageComponent } from './pages/theme-page/theme-page.component';

const routes: Routes = [
  { path: '', component: AdminComponent, children: [
    { path: '', canActivate: [IsLoggedGuard], component: DashboardComponent},
    { path: 'pages', canActivate: [IsLoggedGuard], component: GestionPageComponent},
    { path: 'pages/:id/edit',  canActivate: [IsLoggedGuard], component: ItemEditComponent},
    { path: 'posts', canActivate: [IsLoggedGuard], component: PostsPageComponent },
    { path: 'posts/:id/edit',  canActivate: [IsLoggedGuard], component: ItemEditComponent},
    { path: 'comments', canActivate: [IsLoggedGuard], component: CommentsPageComponent },
    { path: 'media', canActivate: [IsLoggedGuard], component: MediaPageComponent },
    { path: 'theme', canActivate: [IsLoggedGuard],  component: ThemePageComponent }
  ] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

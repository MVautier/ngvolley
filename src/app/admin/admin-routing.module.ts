import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsLoggedGuard } from './guard/is-logged.guard';
import { AdminComponent } from './pages/admin/admin.component';

const routes: Routes = [
  { path: '', component: AdminComponent, children: [
    { path: 'media', canActivate: [IsLoggedGuard],  loadChildren: () => import('@app/ui/media/media.module').then(m => m.MediaModule) },
    { path: 'pages', canActivate: [IsLoggedGuard],  loadChildren: () => import('@app/ui/pages/pages.module').then(m => m.PagesModule) },
    { path: 'comments', canActivate: [IsLoggedGuard],  loadChildren: () => import('@app/ui/comments/comments.module').then(m => m.CommentsModule) },
    { path: 'posts', canActivate: [IsLoggedGuard],  loadChildren: () => import('@app/ui/posts/posts.module').then(m => m.PostsModule) },
    { path: 'theme', canActivate: [IsLoggedGuard],  loadChildren: () => import('@app/ui/theme/theme.module').then(m => m.ThemeModule) }
  ] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

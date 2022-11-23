import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { LayoutService } from './services/layout.service';
import { IsLoggedGuard } from './guard/is-logged.guard';
import { ClickOutsideModule } from 'ng-click-outside';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { GestionPageComponent } from './pages/gestion-page/gestion-page.component';
import { PageCardComponent } from './components/page-card/page-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MediaPageComponent } from './pages/media-page/media-page.component';
import { PostsPageComponent } from './pages/posts-page/posts-page.component';
import { CommentsPageComponent } from './pages/comments-page/comments-page.component';
import { ThemePageComponent } from './pages/theme-page/theme-page.component';
import { PageEditComponent } from './components/page-edit/page-edit.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AdminComponent,
    GestionPageComponent,
    MediaPageComponent,
    PostsPageComponent,
    CommentsPageComponent,
    ThemePageComponent,
    PageCardComponent,
    PageEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialThemeModule,
    DragDropModule,
    ClickOutsideModule,
    AdminRoutingModule
  ],
  providers: [
    IsLoggedGuard,
    LayoutService
  ]
})
export class AdminModule { }

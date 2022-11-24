import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { LayoutService } from './services/layout.service';
import { IsLoggedGuard } from './guard/is-logged.guard';
import { ClickOutsideModule } from 'ng-click-outside';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { GestionPageComponent } from './pages/gestion-page/gestion-page.component';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MediaPageComponent } from './pages/media-page/media-page.component';
import { PostsPageComponent } from './pages/posts-page/posts-page.component';
import { CommentsPageComponent } from './pages/comments-page/comments-page.component';
import { ThemePageComponent } from './pages/theme-page/theme-page.component';
import { ItemEditComponent } from './components/item-edit/item-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormService } from './services/form.service';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AdminComponent,
    GestionPageComponent,
    MediaPageComponent,
    PostsPageComponent,
    CommentsPageComponent,
    ThemePageComponent,
    ItemCardComponent,
    ItemEditComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialThemeModule,
    DragDropModule,
    ClickOutsideModule,
    AdminRoutingModule
  ],
  providers: [
    IsLoggedGuard,
    LayoutService,
    FormService
  ]
})
export class AdminModule { }

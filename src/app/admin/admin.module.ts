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
import { WysiswygService } from './services/wysiswyg.service';
import { BuilderEditorModule } from 'projects/editor/src/lib/builder-editor.module';
import { UtilService } from './services/util.service';
import { CoreModule } from '@app/core/core.module';
import { GalleryService } from './services/gallery.service';
import { ItemEditButtonsComponent } from './components/item-edit-buttons/item-edit-buttons.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AdherentPageComponent } from './pages/adherent-page/adherent-page.component';
import { AdherentListeComponent } from './components/adherent-liste/adherent-liste.component';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { AdherentFilterComponent } from './components/adherent-filter/adherent-filter.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { UserService } from './services/user.service';
import { AdherentCardComponent } from './components/adherent-card/adherent-card.component';
//import { AdherentAdminService } from './services/adherent-admin.service';
import { InscriptionModule } from '@app/inscription/inscription.module';
import { AdherentFormComponent } from './components/adherent-form/adherent-form.component';
import { NgxMaskModule } from 'ngx-mask';
import { GenericModalComponent } from './components/generic-modal/generic-modal.component';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { OrderListeComponent } from './components/order-liste/order-liste.component';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { BtnActionDocComponent } from './components/btn-action-doc/btn-action-doc.component';
import { ParamsPageComponent } from './pages/params-page/params-page.component';

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
    DashboardComponent,
    ItemEditButtonsComponent,
    AdherentPageComponent,
    AdherentListeComponent,
    UserPageComponent,
    AdherentFilterComponent,
    UserCardComponent,
    AdherentCardComponent,
    AdherentFormComponent,
    GenericModalComponent,
    OrdersPageComponent,
    OrderListeComponent,
    OrderCardComponent,
    BtnActionDocComponent,
    ParamsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    MaterialThemeModule,
    DragDropModule,
    BuilderEditorModule,
    ClickOutsideModule,
    AdminRoutingModule,
    NgxChartsModule,
    NgxMaskModule
  ],
  providers: [
    IsLoggedGuard,
    LayoutService,
    FormService,
    WysiswygService,
    UtilService,
    GalleryService,
    UserService
  ]
})
export class AdminModule { }

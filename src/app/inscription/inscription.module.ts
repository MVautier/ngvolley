import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InscriptionRoutingModule } from './inscription-routing.module';
import { InscriptionPageComponent } from './pages/inscription-page/inscription-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialThemeModule } from '@app/material-theme/material-theme.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
import { MainFormComponent } from './components/main-form/main-form.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { InscriptionService } from './services/inscription.service';
import { StartFormComponent } from './components/start-form/start-form.component';
import { CartInfoComponent } from './components/cart-info/cart-info.component';
import { LayoutModule } from '@app/ui/layout/layout.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { SignatureFormComponent } from './components/signature-form/signature-form.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PhotoTakerComponent } from './components/photo-taker/photo-taker.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { WebcamModule } from 'ngx-webcam';
import { CropperComponent } from './components/cropper/cropper.component';
import { ImageComponent } from './components/image/image.component';
import { CameraComponent } from './components/camera/camera.component';
import { ParentAuthComponent } from './components/parent-auth/parent-auth.component';
import { FormHeaderComponent } from './components/form-header/form-header.component';
import { FormFooterComponent } from './components/form-footer/form-footer.component';
import { DocumentFormComponent } from './components/document-form/document-form.component';
import { AdherentDocComponent } from './components/adherent-doc/adherent-doc.component';
import { CartPaymentComponent } from './components/cart-payment/cart-payment.component';
import { HelloAssoService } from './services/helloasso.service';
import { PopupRemoveComponent } from './components/popup-remove/popup-remove.component';
import { CoreModule } from '@app/core/core.module';
import { PhotoService } from './services/photo.service';
import { HealthFormComponent } from './components/health-form/health-form.component';
import { FormInfoComponent } from './components/form-info/form-info.component';
import { PopupAddComponent } from './components/popup-add/popup-add.component';
@NgModule({
  declarations: [
    InscriptionPageComponent,
    MainFormComponent,
    MemberFormComponent,
    StartFormComponent,
    CartInfoComponent,
    SignatureFormComponent,
    PhotoTakerComponent,
    CropperComponent,
    ImageComponent,
    CameraComponent,
    ParentAuthComponent,
    FormHeaderComponent,
    FormFooterComponent,
    DocumentFormComponent,
    AdherentDocComponent,
    CartPaymentComponent,
    PopupRemoveComponent,
    HealthFormComponent,
    FormInfoComponent,
    PopupAddComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialThemeModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    NgxMaskModule,
    InscriptionRoutingModule,
    MaterialFileInputModule,
    NgxDropzoneModule,
    ImageCropperModule,
    WebcamModule
  ],
  providers: [
    HelloAssoService,
    PhotoService
  ]
})
export class InscriptionModule { }

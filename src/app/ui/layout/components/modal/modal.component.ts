import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Type, ViewChild } from '@angular/core';
import { LoginComponent } from '@app/authentication/components/login/login.component';
import { ThemeService } from '@app/core/services/theme.service';
import { CameraComponent } from '@app/inscription/components/camera/camera.component';
import { CropperComponent } from '@app/inscription/components/cropper/cropper.component';
import { ImageComponent } from '@app/inscription/components/image/image.component';
import { ParentAuthComponent } from '@app/inscription/components/parent-auth/parent-auth.component';
import { Subscription } from 'rxjs';
import { DynamicComponent } from '../../interfaces/dynamic.component';
import { ModalConfig } from '../../models/modal-config.model';
import { ModalResult } from '../../models/modal-result.model';
import { Size } from '../../models/size.model';
import { ModalService } from '../../services/modal.service';
import { DynamicDirective } from './../../directives/dynamic.directive';
import { PopupRemoveComponent } from '@app/inscription/components/popup-remove/popup-remove.component';
import { HealthFormComponent } from '@app/inscription/components/health-form/health-form.component';
import { PopupAddComponent } from '@app/inscription/components/popup-add/popup-add.component';
import { PopupErrorComponent } from '@app/inscription/components/popup-error/popup-error.component';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  @Output() validate: EventEmitter<ModalResult> = new EventEmitter<ModalResult>();
  @Output() cancel: EventEmitter<ModalResult> = new EventEmitter<ModalResult>();

  @Input() config: ModalConfig;
  title = 'titre';
  validateLabel = 'Valider';
  cancelLabel = 'Annuler';
  component = 'login'
  size: Size = {
    width: '500px',
    height: 'auto'
  }

  subModal: Subscription;
  isDarkTheme = true;

  @ViewChild(DynamicDirective, { static: true }) private dynamicHost!: DynamicDirective;

  constructor(
    private modalService: ModalService,
    private themService: ThemeService) {
    this.themService.isDarkTheme.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });

    this.title = this.config?.title || this.title;
    this.validateLabel = this.config?.validateLabel || this.validateLabel;
    this.cancelLabel = this.config?.cancelLabel || this.cancelLabel;
    this.size = this.config?.size || this.size;
    this.component = this.config?.component || this.component;
  }

  ngOnInit(): void {
    if (this.component) {
      this.subModal = this.modalService.modalShown.subscribe(config => {
        if (config) {
          this.config = config;
          this.loadComponent(this.config.component);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  private componentTypeFactory(type: string): Type<DynamicComponent> {
    let comp: Type<DynamicComponent> = null;
    switch (type) {
      case 'login':
        comp = LoginComponent;
        break;
      case 'camera':
        comp = CameraComponent;
        break;
      case 'cropper':
        comp = CropperComponent;
        break;
      case 'image':
        comp = ImageComponent;
        break;
      case 'parent-auth':
        comp = ParentAuthComponent;
        break;
      case 'popup-remove':
        comp = PopupRemoveComponent;
        break;
      case 'popup-add':
        comp = PopupAddComponent;
        break;
      case 'popup-error':
        comp = PopupErrorComponent;
        break;
      case 'health-form':
        comp = HealthFormComponent;
        break;
    }

    return comp;
  }

  onClose() {
    this.modalService.close();
  }

  private loadComponent(component: string): void {
    const viewContainerRef = this.dynamicHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent<DynamicComponent>(this.componentTypeFactory(component));
    componentRef.instance.config = this.config;
    componentRef.instance.validate = (result) => {
      this.validate.emit(result);
    };
    componentRef.instance.cancel = (result) => {
      this.cancel.emit(result);
    };
  }
}

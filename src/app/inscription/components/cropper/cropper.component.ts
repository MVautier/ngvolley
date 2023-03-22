import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { ImageCroppedEvent, ImageTransform, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss']
})
export class CropperComponent implements OnInit {
  config: ModalConfig;
  croppedImage: string = 'assets/images/gabarit_ci.png';
  opacity = 50;
  scale = 1;
  flipH = false;
  flipV = false;
  transform: ImageTransform = {
    scale: 1,
    flipH: false,
    flipV: false
  };
  canvasRotation = 0;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(image: LoadedImage) {
    console.log('loaded image: ', image);
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  onRotate() {
    const div = document.querySelector('#gabarit');
    this.canvasRotation += 1;
    if (this.canvasRotation === 4) {
        this.canvasRotation = 0;
    }
  }
  onSwap(mode: string) {
    if (mode === 'h') {
        this.flipH = !this.flipH;
    } else {
        this.flipV = !this.flipV;
    }
    this.transform = {
        scale: this.scale,
        flipH: this.flipH,
        flipV: this.flipV
    }
  }
  onOpacity(event: any) {
    this.opacity = event.value;
    const img = document.querySelector('#cropped');
    this.renderer.setStyle(img, 'opacity', this.opacity / 100);
  }

  onValidate() {
    this.validate({
      action: 'validate',
      data: this.croppedImage
    });
  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: null
    });
  }
}

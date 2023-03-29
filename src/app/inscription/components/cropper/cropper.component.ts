import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { Dimensions, ImageCroppedEvent, ImageTransform, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss']
})
export class CropperComponent implements OnInit {
  config: ModalConfig;
  imageChangedEvent: any = '';
  croppedImage: string = 'assets/images/gabarit_ci.png';
  opacity = 50;
  scale = 1;
  flipH = false;
  flipV = false;
  transform: ImageTransform = {};
  canvasRotation = 0;
  imageBase64: string;
  showCropper = false;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.imageBase64 = this.config.data;
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
}
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(image: LoadedImage) {
    this.showCropper = true;
    console.log('Image loaded');
  }
  cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
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
  onFlip(mode: string) {
    if (mode === 'h') {
        //this.flipH = !this.flipH;
        this.transform = {
            ...this.transform,
            flipH: !this.transform.flipH
        };
    } else {
        //this.flipV = !this.flipV;
        this.transform = {
            ...this.transform,
            flipV: !this.transform.flipV
        };
    }
    // this.transform = {
    //     ...this.transform,
    //     flipH: this.flipH,
    //     flipV: this.flipV
    // };
  }
  zoomOut() {
    this.scale -= .1;
    this.transform = {
        ...this.transform,
        scale: this.scale
    };
}

zoomIn() {
    this.scale += .1;
    this.transform = {
        ...this.transform,
        scale: this.scale
    };
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

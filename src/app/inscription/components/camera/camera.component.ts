import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  config: ModalConfig;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};
  imageResult: string;
  audio: HTMLAudioElement;
  
  @ViewChild('webcam', { static: true }) webcam: ElementRef;

  // toggle webcam on/off
  public showWebcam = true;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  width = 480;
  height = 640;
  mirroring = 'always';

  constructor() { 
    if (window.matchMedia('(max-width: 1025px)').matches) {
        this.width = 240;
        this.height = 320;
    }
  }

  ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs().then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      console.log('webcam: ', this.webcam.nativeElement);
      const wrapper = this.webcam.nativeElement.querySelector('.webcam-wrapper') as HTMLDivElement;
      console.log('webcam wrapper: ', wrapper);
      wrapper.style.backgroundImage = 'url(./../../../../assets/images/gabarit_webcam.png)';
      wrapper.style.backgroundSize = 'contain';
      wrapper.style.backgroundRepeat = 'no-repeat';
      wrapper.style.backgroundPosition = 'center';
      const video = wrapper.getElementsByTagName('video')[0];
      console.log('video: ', video);
      if (video) {
        video.style.opacity = '0.7';
      }
    });
    this.audio = new Audio();
    //Can externalize the variables
    this.audio.src = './../../../../assets/sounds/photo.mp3';
    this.audio.load();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by user!");
    }
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }


  imageCapture(capture: WebcamImage) {
    this.audio.play();
    console.log('captured image: ', capture);
    this.cropPhoto(capture).then(data => {
        this.imageResult = data;
    });
  }

  cropPhoto(capture: WebcamImage): Promise<string> {
    return new Promise((resolve, reject) => {
        const data = capture.imageAsDataUrl;
        const x = 180;
        const y = 80;
        const w = 280;
        const h = 340;
        const img = new Image();
        img.onload = () => {
            const info = `
            imgW: ${img.naturalWidth}<br>
            imgH: ${img.naturalHeight}<br>
            w: ${w}<br>
            h: ${h}<br>
            ratio: ${window.devicePixelRatio}<br>`;
            document.querySelector('#log-photo').innerHTML = info;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const screenMode = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
            const context = canvas.getContext('2d');
            this.mirrorImage(context, img, 0, 0, true);
            context.drawImage(img, 
                screenMode === 'landscape' ? x : y + 10, 
                screenMode === 'landscape' ? y : x - 10, 
                w, h, 0, 0, w, h);
            const newData = canvas.toDataURL();
            canvas.remove();
            resolve(newData);
        };
        img.onerror = () => {
            resolve(data);
        };
        img.src = data;
    });
  }

  mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false) {
    ctx.save();  // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0, // set the direction of x axis
        0, vertical ? -1 : 1,   // set the direction of y axis
        x + (horizontal ? image.width : 0), // set the x origin
        y + (vertical ? image.height : 0)   // set the y origin
    );
    //ctx.drawImage(image,0,0);
    ctx.restore(); // restore the state as it was when this function was called
}

  onValidate() {
    this.validate({
      action: 'validate',
      data: this.imageResult
    });
  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: null
    });
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}

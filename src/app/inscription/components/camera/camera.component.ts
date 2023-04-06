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
  width = 640;
  height = 480;
  mirroring = 'always';

  constructor() { 
    if (window.matchMedia('(max-width: 1025px)').matches) {
        this.width = 320;
        this.height = 240;
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
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const x = 180; //this.width / 3.5;
        const y = 80; //this.height / 6;
        const w = 280; //this.width / 2.3;
        const h = 340; //this.height / 1.4;
        canvas.width = w;
        canvas.height = h;
        const img = new Image();
        img.width = this.width;
        img.height = this.height;
        img.onload = () => {
            context.drawImage(img, x, y, w, h, 0, 0, w, h);
            const newData = canvas.toDataURL();
            //console.log('data: ', newData);
            //canvas.remove();
            resolve(newData);
        };
        img.onerror = () => {
            resolve(data);
        };
        img.src = data;
    });
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

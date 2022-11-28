
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CKFinderImage } from 'projects/editor/src/lib/models/ckfinder-image.model';
import { ImageRequest } from 'projects/editor/src/lib/models/image-request.model';
import { Script } from 'projects/editor/src/lib/models/script.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GalleryService {

    private script: Script = { name: 'ckFinderJS', type: 'js', loaded: false, status: null, src: 'assets/ckfinder/ckfinder.js' };
    public isSetCKFinder : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public selectedImage : BehaviorSubject<CKFinderImage> = new BehaviorSubject<CKFinderImage>(null);
    public selectedSrc: BehaviorSubject<ImageRequest> = new BehaviorSubject<ImageRequest>(null);
    private ckfinder: any;

    constructor() {
        console.log('==================== GALLERY CONSTRUCTOR');
        this.init();
    }

    init() {
        this.loadScript(this.script).then(result => {
            if (result.loaded) {
                console.log('==================== CKFINDER LOADED');
                this.setEnabled(result.loaded);
            } else {
                console.log('==================== CKFINDER NOT LOADED');
            }
        }).catch(err => {
            console.log('==================== ERROR LOADING CKFINDER: ', err);
        });
    }

    public loadScript(source: Script): Promise<Script> {
        return new Promise((resolve, reject) => {
          //if already loaded
          const id = source.name;
          const exists = document.querySelector('#' + id);
          if (source.loaded || exists) {
            resolve({
              name: source.name,
              src: source.src,
              type: source.type,
              loaded: true,
              status: 'Already Loaded'
            });
          } else {
            //load script
            let script = document.createElement(source.type === 'css' ? 'link' : 'script');
            script.id = source.name;
            if (source.type === 'js') {
              (script as HTMLScriptElement).async = false;
              (script as HTMLScriptElement).src = source.src;
              (script as HTMLScriptElement).async = false;
            }
            if (source.type === 'css') {
              (script as HTMLLinkElement).rel = 'stylesheet';
              script.type = "text/css";
              (script as HTMLLinkElement).href = source.src;
            }
            script.onload = () => {
              source.loaded = true;
              resolve({ name: source.name, src: source.src, type: source.type, loaded: true, status: 'Loaded' });
            };
            script.onerror = (error: any) => {
              console.log(error);
              resolve({ name: source.name, src: source.src, type: source.type, loaded: false, status: 'Loaded' });
            };
            document.getElementsByTagName('head')[0].appendChild(script);
          }
        });
    }

    setEnabled(loaded: boolean) {
        this.isSetCKFinder.next(loaded);
        if (loaded) {
            this.ckfinder = window['CKFinder'];
            this.ckfinder.basePath = '/assets/ckfinder/';
            this.ckfinder.baseUrl = environment.basePath + 'assets/ckfinder/';
            this.ckfinder.uploadUrl = environment.apiUrl + 'ckfinder/';
            this.ckfinder.config.connectorPath = environment.apiUrl + 'ckfinder/';
            this.ckfinder._connectors['net'] = environment.apiUrl + 'ckfinder';
            var send = window.XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function () {
                //console.log('================= intercept http request', this);
                if (!this.withCredentials) {
                  //console.log('================= set credentials for http request');
                  this.withCredentials = true;
                }
                send.apply(this, arguments);
            };
            console.log('===================== initialize CKFinder', this.ckfinder);
        }
    }
}
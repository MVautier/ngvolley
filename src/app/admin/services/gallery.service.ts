
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CKFinderImage } from 'projects/editor/src/lib/models/ckfinder-image.model';
import { ImageRequest } from 'projects/editor/src/lib/models/image-request.model';
import { Script } from 'projects/editor/src/lib/models/script.model';
import { BehaviorSubject } from 'rxjs';
import { SelectedImage } from '../models/selected-image.model';

@Injectable()
export class GalleryService {

    private script: Script = { name: 'ckFinderJS', type: 'js', loaded: false, status: null, src: 'assets/ckfinder/ckfinder.js' };
    public isSetCKFinder : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public selectedImage : BehaviorSubject<CKFinderImage> = new BehaviorSubject<CKFinderImage>(null);
    public selectedSrc: BehaviorSubject<ImageRequest> = new BehaviorSubject<ImageRequest>(null);
    private ckfinder: any;
    private obsSrc: any;

    constructor(private http: HttpClient) {
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
            this.ckfinder.baseUrl = (environment.ssrMode ? environment.basePathSsr : environment.basePath) + 'assets/ckfinder/';
            this.ckfinder.uploadUrl = environment.apiUrl + 'gallery/';
            this.ckfinder.config.connectorPath = environment.apiUrl + 'gallery/';
            this.ckfinder._connectors['net'] = environment.apiUrl + 'gallery';
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

    openGallery(request: ImageRequest) {
        if (!this.ckfinder) {
            return;
        }
        this.open(null, request);
    }

    open(_src: any, request: ImageRequest = null) {
        //console.log('ckfinder opening');
        this.ckfinder.basePath = environment.basePath + 'assets/ckfinder/';
        //this.sender = sender;
        //this.event = event || null;
        this.obsSrc = _src;
        this.ckfinder.modal({
            language: 'fr',
            thumbnailDelay: 200,
            //token: this.getToken(),
            onInit: finder => {
                //console.log('==================== ckfinder init terminated');
                //console.log(finder);
                finder.on('command:before', evt => {
                    // fired before sending a command -> add token to request headers
                    //this.ckfinder.token = this.getToken();
                }, null, null, 1);
                finder.on('files:choose', evt => {
                    // fired when file is selected for upload
                    //console.log('================= choose file');
                    //console.log (evt);
                });
                finder.on('command:ok:FileUpload', evt => {
                    // fired when file is selected for upload
                    //console.log('================= choose file');
                    console.log (evt);
                });
                finder.on('command:error:FileUpload', evt => {
                    // fired when file is selected for upload
                    //console.log('================= choose file');
                    console.log (evt);
                    evt.stop();
                });
                finder.on('folder:getFiles:after', evt => {
                    // fired after files are displayed
                    // console.log('================= folder:getFiles:after');
                    // console.log (evt);
                    if (request && request.origin) {
                        var allFiles = finder.request( 'files:getCurrent' );
                        var files = allFiles.models;
                        if (files && files.length) {
                            let found = null;
                            const name = this.getName(request.origin);
                            for (let i = 0; i < files.length; i++) {
                                if (files[i].attributes['name'] === name) {
                                    found = files[i];
                                    break;
                                }
                            }
                            if (found) {
                                finder.request( 'files:select', { files: [found] } );
                            } else {
                                finder.request( 'dialog:info', {
                                    msg: 'L\'image n\'est pas dans ce dossier',
                                    title: 'Information'
                                } );
                            }
                        }
                    }
                });
                finder.on('files:selected', evt => {
                    // fired when file is selected in ui
                    //console.log (evt);
                    if (evt && evt.data && evt.data.files && evt.data.files.models && evt.data.files.models.length === 1) {
                        const model = evt.data.files.models[0];
                        const img = model.attributes;
                        
                        this.selectedImage.next({
                            name: img.name,
                            size: img.size,
                            date: img.date,
                            folderPath: this.getSelectedFolder(img),
                            folderUrl: img.folder.attributes['url'],
                            width: 0,
                            height: 0
                        });
                    } else {
                        this.selectedImage.next(null);
                    }
                });
                finder.on('toolbar:reset:Main', evt => {
                    //console.log('================= toolbar reset');
                    //console.log (evt);
                    if (this.selectedImage.value) {
                        evt.data.toolbar.push({
                            name: 'AddToCompo',
                            label: 'Ajouter à la composition',
                            priority: 100,
                            icon: 'check',
                            action: () => {
                            this.sendImageToEditor(request);
                            }
                        });
                    } else {
                        const toRemove = [];
                        evt.data.toolbar.forEach((button, index, toolbar) => {
                            if (button.get('name') == 'AddToCompo') {
                                toRemove.push(button);
                            }
                        });
                        if (toRemove.length > 0) {
                            evt.data.toolbar.remove(toRemove);
                        }
                    }
                });
            }
        });
    }

    close() {
        document.getElementById('ckf-modal-close').click();
    }

    sendImageToEditor(request: ImageRequest) {
        if (this.selectedImage.value) {
            console.log('============================= sendImageToEditor');
            this.close();
            const img = this.selectedImage.value;
            this.copyToServer(img.folderPath, img.name).then(result => {
                this.selectedSrc.next({
                    index: request.index,
                    origin: request.origin,
                    src: result.src,
                    mode: request.mode,
                    text: request.text
                });
            });
        }
    } 

    copyToServer(folder: string, filename: string): Promise<SelectedImage> {
        return this.http.get<SelectedImage>(environment.apiUrl + 'gallery?command=SelectImage&currentFolder=' + folder + '&fileName=' + filename, { withCredentials: true }).toPromise();
    }

    getName(src: string): string {
        if (src) {
            var pattern = /[0-9\w-]+\.(jpg|gif|png|jpeg)/gis;
            var result = src.match(pattern);
            if (result && result.length) {
            return result[0].replace(/2F/gis, '');
            }
        }
        return null;
    }

    private getSelectedFolder(img: any): string {
        let folder = '';
        const isRoot = img.folder.attributes['isRoot'];
        if (isRoot) {
            folder = img.folder.attributes['path'];
        } else {
            folder = '/' + img.folder.attributes['name'] + '/';
            let parent = img.folder.attributes['parent'];
            while (parent && !parent.attributes['isRoot']) {
                folder = '/' + parent.attributes['name'] + folder;
                parent = parent.attributes['parent'];
            }

        }
        return folder;
    }
}
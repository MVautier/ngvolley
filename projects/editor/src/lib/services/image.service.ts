import {Injectable} from '@angular/core';
import { BrowserService } from './browser.service';
import { UndoItem } from '../../lib/models/undo-item.model';
import { UndoManagerService } from './undo-manager.service';
import { BehaviorSubject } from 'rxjs';
import { EditorService } from './editor.service';
import { DomService } from './dom.service';


@Injectable()
export class ImageService {
    editor: HTMLElement;
    resizing: boolean = false;
    currentImage: HTMLImageElement;
    offsetLeft: number;
    offsetTop: number;
    imgPosition: {left: number, top: number, width: number, height: number};
    currentButton: HTMLElement;
    correctionX = 0;
    public imageResized: BehaviorSubject<HTMLImageElement> = new BehaviorSubject<HTMLImageElement>(null);
    public imageRemoved: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    color: string = '#ff6600';
    scrollable: HTMLElement;
    document: any;

    constructor(
        private browserService: BrowserService, 
        private editorService: EditorService,
        private domService: DomService,
        private undoManager: UndoManagerService) {
        this.correctionX = this.browserService.browserName === 'firefox' ? 1 : 0;
    }

    public init(element: HTMLDivElement, doc: any) {
        this.document = doc;
        this.domService.initDocument(doc);
        this.removeResizeFrame();
        this.editor = element; //document.getElementById(id);
        this.initOffsets();
        this.bindEvents();
    }

    public removeResizeFrame() {
        this.domService.removeResizeFrame();
        this.unbindEvents();
    }

    private bindEvents() {
        this.editor.addEventListener('scroll', this.scrollHandler.bind(this), false);
        this.editor.addEventListener('mouseup', this.mouseupHandler.bind(this));
    }

    private unbindEvents() {
        this.removeEvent('mouseup', this.mouseupHandler);
        this.removeEvent('mouseup', this.mouseupHandler);
        this.removeEvent('mousemove', this.mouseupImageHandler);
    }

    private removeEvent(event: string, handler: any) {
        try {
            this.editor.removeEventListener(event, handler);
        } catch(err) {
            //console.log('unable to remove event listener: ', event);
        }
    }

    private scrollHandler() {
        this.reset();
    }

    private mouseupHandler(e: any) {
        if (!this.resizing) {
            const x = (e.x) ? e.x : e.clientX - this.offsetLeft;
            const y = (e.y) ? e.y : e.clientY - this.offsetTop;
            let mouseUpElement = this.document.elementFromPoint(x, y);
            if (mouseUpElement) {
                let matchingElement = null;
                if (mouseUpElement.tagName === 'IMG') {
                    matchingElement = mouseUpElement;
                }
                if (!matchingElement) {
                    this.reset();
                } else {
                    this.clickImage(matchingElement);
                }
            }
        }
    }

    private mouseupImageHandler() {
        this.currentButton = null;
        if (this.resizing) {
            const oldWidth = this.currentImage.style.width;
            const oldHeight = this.currentImage.style.height;
            const newWidth = (this.document.querySelector('.top-border') as HTMLElement).offsetWidth + 'px';
            const newHeight = (this.document.querySelector('.left-border') as HTMLElement).offsetHeight + 'px';
            this.currentImage.style.width = newWidth;
            this.currentImage.style.height = newHeight;
            this.refresh();
            this.currentImage.click();
            this.resizing = false;
            const undoItem: UndoItem = {
                element: this.currentImage,
                originalContent: '',
                undo: (element) => {
                    element.style.width = oldWidth;
                    element.style.height = oldHeight;
                    this.clickImage(element);
                },
                redo: (element) => {
                    element.style.width = newWidth;
                    element.style.height = newHeight;
                    this.clickImage(element);
                }
            };
            this.undoManager.addItem(undoItem);
        }
    }

    private mousemoveImageHandler(e: any) {
        if (this.currentImage && this.resizing && this.currentButton) {
            const css = this.currentButton.className;
            const editorScrollTop = this.scrollable ? this.scrollable.scrollTop : 0;
            const editorScrollLeft = this.scrollable ? this.scrollable.scrollLeft : 0;
            const offsetTop = this.offsetTop - editorScrollTop;
            const offsetLeft = this.offsetLeft - editorScrollLeft;
            this.domService.resize(e, offsetTop, offsetLeft, css);
        }
        return false;
    }

    private initOffsets() {
        const scrollLeft = this.editor.scrollLeft || window.pageXOffset || this.document.documentElement.scrollLeft;
        const scrollTop = this.editor.scrollTop || window.pageYOffset || this.document.documentElement.scrollTop;
        this.scrollable = this.domService.findFirstScrollable(this.editor);
        this.offsetLeft = scrollLeft;
        this.offsetTop = scrollTop;
    }

    private clickImage(img: HTMLImageElement) {
        this.removeResizeFrame();
        this.currentImage = img;
        this.imgPosition = this.getOffset(this.currentImage);
        this.domService.addResizeFrame(this.editor, this.imgPosition, this.color);
        this.addButtons();
        this.editorService.selectImage(img);
        this.editorService.selectedImage = img;
        this.editor.removeEventListener('mouseup', this.mouseupHandler);
        this.editor.addEventListener('mouseup', this.mouseupImageHandler.bind(this));
        this.editor.addEventListener('mousemove', this.mousemoveImageHandler.bind(this));
    }

    private getOffset (el: HTMLElement): any {
        if (!el || !el.getBoundingClientRect) {
            return { top: 0, left: 0, width: 0,height: 0 };
        }
        const rect = el.getBoundingClientRect();
        // const editorScrollTop = this.scrollable ? this.scrollable.scrollTop : 0;
        // const editorScrollLeft = this.scrollable ? this.scrollable.scrollLeft : 0;
        // const scrollTop =  editorScrollTop || window.pageYOffset || this.document.documentElement.scrollTop
        // const scrollLeft = editorScrollLeft || window.pageXOffset || this.document.documentElement.scrollLeft;
        const scrollTop =  this.document.documentElement.scrollTop || 0;
        const scrollLeft = this.document.documentElement.scrollLeft || 0;
        return { 
            top: rect.y + scrollTop - 1, //  - this.offsetTop
            left: rect.x + scrollLeft - this.correctionX - 1, // - this.offsetLeft
            width: el.offsetWidth, 
            height: el.offsetHeight
        };
    }

    private addButtons() {
        const buttons = this.document.getElementsByClassName('resize-frame');
        const trashButton = this.document.querySelector('.btn-trash') as HTMLElement;
        Array.prototype.slice.call(buttons).forEach((button: HTMLElement) => {
            button.onmousedown = (e) => {
                this.currentButton = e.target as HTMLElement;
                this.resizing = true;
                return false;
            };
        });

        trashButton.onmousedown = (e) => {
            if (this.currentImage && e.button === 0) {
                this.removeResizeFrame();
                this.removeImage();
                e.stopImmediatePropagation();
                return false;
            }
        };
    }

    private removeImage() {
        //console.log('remove image');
        const parentNode = this.currentImage.parentNode as HTMLElement;
        const originalContent = parentNode.innerHTML;
        parentNode.removeChild(this.currentImage);
        const undoItem: UndoItem = {
            element: parentNode,
            originalContent: originalContent,
            newContent: parentNode.innerHTML,
            undo: (element: HTMLElement, content: string) => {
                element.innerHTML = content;
            },
            redo: (element: HTMLElement, content: string) => {
                element.innerHTML = content;
            }
        };
        this.undoManager.addItem(undoItem);
        
        this.imageRemoved.next('removed');
    }

    // private bindClickListener() {
    //     this.editor.querySelectorAll('img').forEach((img) => {
    //         img.onclick = (e) => {
    //             if (e.target === img) {
    //                 this.clickImage(img);
    //             }
    //         };
    //     });
    // }

    private refresh() {
        //this.bindClickListener();
        this.removeResizeFrame();
        if (!this.currentImage) {
            return;
        }
        this.imageResized.next(this.currentImage);
        this.imgPosition = this.getOffset(this.currentImage);
        this.domService.addResizeFrame(this.editor, this.imgPosition, this.color);
    }

    private reset() {
        if (this.currentImage != null) {
            this.currentImage = null;
            this.editorService.selectedImage = null;
            this.resizing = false;
            this.removeResizeFrame();
        }
        //this.bindClickListener();
    }
}
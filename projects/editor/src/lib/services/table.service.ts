import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import { BrowserService } from './browser.service';
import { UndoItem } from '../../lib/models/undo-item.model';
import { UndoManagerService } from './undo-manager.service';
import { BehaviorSubject } from 'rxjs';
import { EditorService } from './editor.service';
import { DomService } from './dom.service';


@Injectable()
export class TableService {
    //public tableSelected: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public tableResized: BehaviorSubject<HTMLTableElement> = new BehaviorSubject<HTMLTableElement>(null);
    public tableRemoved: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    editor: HTMLElement;
    currentButton: HTMLElement;
    correctionX = 0;
    resizing: boolean = false;
    currentTable: HTMLTableElement;
    currentRow: HTMLTableRowElement;
    currentColumn: HTMLTableColElement;
    currentCell: HTMLTableCellElement;
    offsetLeft: number;
    offsetTop: number;
    tablePosition: {left: number, top: number, width: number, height: number};
    color: string = '#ccc';
    toolbar: HTMLElement;
    commands = ['remove-table', 'insert-row-before', 'insert-row-after', 'remove-row', 'insert-col-before', 'insert-col-after', 'remove-col'];
    document: any;

    constructor(
        private browserService: BrowserService, 
        @Inject(DOCUMENT) private doc: any, 
        private editorService: EditorService,
        private domService: DomService,
        private undoManager: UndoManagerService) {
        this.correctionX = this.browserService.browserName === 'firefox' ? 1 : 0;
    }

    public init(element: HTMLDivElement, doc: any) {
        this.document = doc;
        this.domService.initDocument(doc);
        this.domService.removeResizeFrame();
        this.editor = element; //document.getElementById(id);
        this.initOffsets();
        var that = this;
        this.editor.addEventListener('scroll', function () {
            that.reset();
        }, false);
        this.editor.addEventListener('click', function (e) {
            if (!that.resizing) {
                const x = (e.x) ? e.x : e.clientX -that.offsetLeft;
                const y = (e.y) ? e.y : e.clientY - that.offsetTop;
                let mouseUpElement = that.document.elementFromPoint(x, y);
                if (mouseUpElement && mouseUpElement.tagName !== 'IMG') {
                    mouseUpElement = that.getTableElement(mouseUpElement as HTMLElement);
                    if (mouseUpElement) {
                        let matchingElement = null;
                        if (mouseUpElement.tagName === 'TABLE') {
                            matchingElement = mouseUpElement;
                        }
                        if (!matchingElement) {
                            that.reset();
                        } else {
                            that.clickTable(matchingElement);
                        }
                    }
                } else {
                    //that.tableSelected.next(null);
                }
            }
        });
        // this.editor.onblur = (e) => {
        //     this.domService.removeResizeFrame();
        //     this.tableSelected.next(null);
        // }
    }

    private initOffsets() {
        const rect = this.editor.getBoundingClientRect();
        const scrollLeft = this.editor.parentElement.scrollLeft || window.pageXOffset || this.document. documentElement.scrollLeft;
        const scrollTop = this.editor.parentElement.scrollTop || window.pageYOffset || this.document.documentElement.scrollTop;
        this.offsetLeft = rect.left + scrollLeft;
        this.offsetTop = rect.top + scrollTop;
    }

    private getTableElement(item: HTMLElement): HTMLTableElement {
        this.currentTable = null;
        this.currentRow = null;
        this.currentColumn = null;
        this.currentCell = null;
        if (item.tagName === 'TABLE') {
            this.currentTable = item as HTMLTableElement;
        } else if (item.tagName === 'TR') {
            this.currentRow = item as HTMLTableRowElement;
            if (this.currentRow.parentElement) {
                this.currentTable = this.passTbody(this.currentRow);
            }
        } else if (item.tagName === 'TD' || item.tagName === 'TH') {
            this.currentColumn = item as HTMLTableColElement;
            if (this.currentColumn.parentElement) {
                this.currentRow = this.currentColumn.parentElement as HTMLTableRowElement;
                if (this.currentRow.parentElement) {
                    this.currentTable = this.passTbody(this.currentRow);
                }
            }
        } else {
            while(item !== this.editor && item.parentElement) {
                this.currentTable =  this.getTableElement(item.parentElement);
            }
            return null;
        }
        return this.currentTable;
    }

    passTbody(row: HTMLTableRowElement): HTMLTableElement {
        if (row.parentElement) {
            if (row.parentElement.tagName === 'THEAD' || row.parentElement.tagName === 'TBODY' || row.parentElement.tagName === 'TFOOT') {
                return row.parentElement.parentElement as HTMLTableElement;
            } else {
                return row.parentElement as HTMLTableElement;
            }     
        }
    }

    private clickTable(table: HTMLTableElement) {
        console.log('table was clicked', table);
        if (this.currentTable) {
            this.domService.removeResizeFrame();
            this.tablePosition = this.getOffset(this.currentTable);
            this.domService.addResizeFrame(this.editor, this.tablePosition, this.color, 'table');
            this.addButtons();
            this.toolbar = this.document.querySelector('.angular-editor-table-utility') as HTMLElement;
            this.showToolbar();
            //this.tableSelected.next(this.tablePosition);

            this.editor.onmouseup = () => {
                this.currentButton = null;
                if (this.resizing) {
                    const oldWidth = this.currentTable.style.width;
                    const oldHeight = this.currentTable.style.height;
                    const newWidth = (this.document.querySelector('.top-border') as HTMLElement).offsetWidth + 'px';
                    const newHeight = (this.document.querySelector('.left-border') as HTMLElement).offsetHeight + 'px';
                    this.currentTable.style.width = newWidth;
                    this.currentTable.style.height = newHeight;
                    this.refresh();
                    this.currentTable.click();
                    this.resizing = false;
                    const undoItem: UndoItem = {
                        element: this.currentTable,
                        originalContent: '',
                        undo: (element) => {
                            element.style.width = oldWidth;
                            element.style.height = oldHeight;
                            this.clickTable(element);
                        },
                        redo: (element) => {
                            element.style.width = newWidth;
                            element.style.height = newHeight;
                            this.clickTable(element);
                        }
                    };
                    this.undoManager.addItem(undoItem);
                }
            };

            this.editor.onmousemove = (e) => {
                if (this.currentTable && this.resizing && this.currentButton) {
                    const css = this.currentButton.className;
                    this.domService.resize(e, this.offsetTop, this.offsetLeft, css);
                }
                return false;
            };
        }
    }

    private refresh() {
        this.bindClickListener();
        this.domService.removeResizeFrame();
        if (!this.currentTable) {
            return;
        }
        this.tableResized.next(this.currentTable);
        this.tablePosition = this.getOffset(this.currentTable);
        this.domService.addResizeFrame(this.editor, this.tablePosition, this.color, 'table');
        this.toolbar = this.document.querySelector('.angular-editor-table-utility') as HTMLElement;
    }

    private addButtons() {
        console.log('addButtons');
        const buttons = this.document.getElementsByClassName('resize-frame');
        Array.prototype.slice.call(buttons).forEach((button: HTMLElement) => {
            button.onmousedown = (e) => {
                this.currentButton = e.target as HTMLElement;
                this.resizing = true;
                return false;
            };
        });

        const tableButtons = this.document.getElementsByClassName('button-table');
        Array.prototype.slice.call(tableButtons).forEach((button: HTMLElement) => {
            var that = this;
            button.onclick = (e) => {
                const command = button.classList[button.classList.length - 1];
                console.log('table button was clicked: ', command);
                if (that.commands.includes(command)) {
                    that.triggerCommand(command);
                }
            };
        });

        // trashButton.onmousedown = (e) => {
        //     if (this.currentTable) {
        //         this.domService.removeResizeFrame();
        //         this.removeTable();
        //         e.stopImmediatePropagation();
        //         return false;
        //     }
        // };
    }

    public triggerCommand(command: string) {
        switch(command) {
            case 'remove-table':
                this.removeTable();
                break;
            case 'insert-row-before':
                this.insertRowBefore();
                break;
            case 'insert-row-after':
      
                break;
            case 'remove-row':
      
                break;
            case 'insert-col-before':
      
                break;
            case 'insert-col-after':
      
                break;
            case 'remove-col':
      
              break;
          }
    }

    removeTable() {
        //console.log('remove image');
        const parentNode = this.currentTable.parentNode as HTMLElement;
        this.undoManager.addItem(this.getRemoveItem(parentNode, this.currentTable));
        this.currentTable.parentNode.removeChild(this.currentTable);
        this.tableRemoved.next('removed');
    }

    insertRowBefore() {
        if (this.currentRow) {
            const row = this.document.createElement('tr');
            const col = this.document.createElement('td');
            row.appendChild(col);
            this.currentRow.insertAdjacentElement('beforebegin', row);
        }
    }

    getRemoveItem(parent: HTMLElement, el: HTMLElement): UndoItem {
        return {
            element: parent,
            originalContent: parent.innerHTML,
            undo: (element: HTMLElement) => {
                element.appendChild(el);
            },
            redo: (element: HTMLElement) => {
                element.removeChild(el);
            }
        }
    }

    private getOffset (el: HTMLElement): any {
        if (!el || !el.getBoundingClientRect) {
            return { top: 0, left: 0, width: 0,height: 0 };
        }
        const rect = el.getBoundingClientRect();
        const scrollLeft = this.editor.parentElement.scrollLeft || window.pageXOffset || this.document.documentElement.scrollLeft;
        const scrollTop = this.editor.parentElement.scrollTop || window.pageYOffset || this.document.documentElement.scrollTop;
        const editorScrollTop = this.editor.scrollTop;
        const editorScrollLeft = this.editor.scrollLeft;
        return { 
            top: rect.y - this.offsetTop + scrollTop - editorScrollTop - 1, 
            left: rect.x - this.offsetLeft + scrollLeft - this.correctionX - editorScrollLeft - 2, 
            width: el.offsetWidth, 
            height: el.offsetHeight
        };
    }

    private bindClickListener() {
        this.editor.querySelectorAll('table').forEach((table) => {
            table.onclick = (e) => {
                if (e.target === table) {
                    this.clickTable(table);
                }
            };
        });
    }

    private reset() {
        if (this.currentTable != null) {
            this.currentTable = null;
            this.currentRow = null;
            this.currentColumn = null;
            this.currentCell = null;
            this.resizing = false;
            this.domService.removeResizeFrame();
            //this.tableSelected.next(null);
        }
        this.bindClickListener();
    }

    private showToolbar() {
        if (this.toolbar && this.tablePosition) {
            this.toolbar.style.display = 'flex';
            this.toolbar.style.top = this.tablePosition.top - 66 + 'px';
            this.toolbar.style.left = this.tablePosition.left + 'px';
        }
    }

    private hideToolbar() {
        if (this.toolbar) {
            this.toolbar.style.display = 'none';
        }
    }
}
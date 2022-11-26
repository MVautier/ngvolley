import {Inject, Injectable} from '@angular/core';


@Injectable()
export class DomService {
    document: any;

    public initDocument(doc: any) {
        this.document = doc;
    }

    public addResizeFrame(el: HTMLElement, pos: any, color: string, mode: string = 'image') {
        const x = pos.left;
        const y = pos.top;
        const w = pos.width;
        const h = pos.height;
        // Bouton en haut à gauche
        el.append(this.getResizeButton(x - 20, y - 20, 'top-left', color));

        // Bouton en haut à droite
        el.append(this.getResizeButton(x + w - 10, y - 20, 'top-right', color));

        // Bouton en bas à droite
        el.append(this.getResizeButton(x + w - 10, y + h - 10, 'bottom-right', color));

        // Bouton en bas à gauche
        el.append(this.getResizeButton(x - 20, y + h - 10, 'bottom-left', color));

        // Ligne en haut
        el.append(this.getResizeBorder(x, y - 1, w, 0, 'resizer top-border', color));

        // Ligne à gauche
        el.append(this.getResizeBorder(x, y, 0, h, 'resizer left-border', color));

        // Ligne à droite
        el.append(this.getResizeBorder(x + w, y, 0, h, 'resizer right-border', color));

        // Ligne en bas
        el.append(this.getResizeBorder(x, y + h, w, 0, 'resizer bottom-border', color));

        // Bouton Delete
        if (mode === 'image') {
            const trash = this.getTrashButton(x + w - 35, y - 5, color);
            // fill="#ff6600" width="11"
            trash.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#ff6600" width="12"><path d="M160 400C160 408.8 152.8 416 144 416C135.2 416 128 408.8 128 400V192C128 183.2 135.2 176 144 176C152.8 176 160 183.2 160 192V400zM240 400C240 408.8 232.8 416 224 416C215.2 416 208 408.8 208 400V192C208 183.2 215.2 176 224 176C232.8 176 240 183.2 240 192V400zM320 400C320 408.8 312.8 416 304 416C295.2 416 288 408.8 288 400V192C288 183.2 295.2 176 304 176C312.8 176 320 183.2 320 192V400zM317.5 24.94L354.2 80H424C437.3 80 448 90.75 448 104C448 117.3 437.3 128 424 128H416V432C416 476.2 380.2 512 336 512H112C67.82 512 32 476.2 32 432V128H24C10.75 128 0 117.3 0 104C0 90.75 10.75 80 24 80H93.82L130.5 24.94C140.9 9.357 158.4 0 177.1 0H270.9C289.6 0 307.1 9.358 317.5 24.94H317.5zM151.5 80H296.5L277.5 51.56C276 49.34 273.5 48 270.9 48H177.1C174.5 48 171.1 49.34 170.5 51.56L151.5 80zM80 432C80 449.7 94.33 464 112 464H336C353.7 464 368 449.7 368 432V128H80V432z"/></svg>');
            el.append(trash);
        }
        if (mode === 'table') {
            el.parentElement.insertAdjacentElement('beforeend', this.getToolbarTable());
        }
    }

    public resize(e: MouseEvent, offsetTop: number, offsetLeft: number, css: string) {
        let x = 0, y = 0, w = 0, h = 0, btnX = 0, btnY = 0;
        const topBorder = this.document.querySelector('.top-border') as HTMLElement;
        const rightBorder = this.document.querySelector('.right-border') as HTMLElement;
        const bottomBorder = this.document.querySelector('.bottom-border') as HTMLElement;
        const leftBorder = this.document.querySelector('.left-border') as HTMLElement;
        const btnNW = this.document.querySelector('.resize-frame.top-left') as HTMLElement;
        const btnNE = this.document.querySelector('.resize-frame.top-right') as HTMLElement;
        const btnSE = this.document.querySelector('.resize-frame.bottom-right') as HTMLElement;
        const btnSW = this.document.querySelector('.resize-frame.bottom-left') as HTMLElement;
        const left = e.pageX - 1; // - offsetLeft - 1;
        const top = e.pageY - 1; // - offsetTop - 1;
        //console.log('pageY: ', e.pageY, ' - offsetTop: ', offsetTop, ' - top: ', top);
        // const left = e.pageX - 1;
        // const top = e.pageY - 1;
        switch(css) {
            case 'resize-frame top-left':
                btnX = left - 20;
                btnY = top - 20;
                x = left;
                y = top;
                w = this.getNumber(rightBorder.style.left) - btnX - 20;
                h = this.getNumber(bottomBorder.style.top) - btnY - 20;
                this.setStyle(topBorder, { left: x + 'px', top: y + 'px', width: w + 'px' });
                this.setStyle(rightBorder, { top: y + 'px', height: h + "px" });
                this.setStyle(bottomBorder, { left: x + 'px', width: w + "px" });
                this.setStyle(leftBorder, { left: x + 'px', top: y + 'px', height: h + "px" });

                this.setStyle(btnNW, { left: btnX + 'px', top: btnY + 'px' });
                this.setStyle(btnNE, { top: btnY + 'px' });
                this.setStyle(btnSW, { left: btnX + 'px' });
                break;
            case 'resize-frame top-right':
                btnX = left - 10;
                btnY = top - 20;
                x = left;
                y = top;
                w = btnX - this.getNumber(leftBorder.style.left) + 10;
                h = this.getNumber(bottomBorder.style.top) - btnY - 20;
                this.setStyle(topBorder, { top: y + 'px', width: w + 'px' });
                this.setStyle(rightBorder, { left: x + 'px', top: y + 'px', height: h + "px" });
                this.setStyle(bottomBorder, { width: w + "px" });
                this.setStyle(leftBorder, { top: y + 'px', height: h + "px" });

                this.setStyle(btnNE, { left: btnX + 'px', top: btnY + 'px' });
                this.setStyle(btnNW, { top: btnY + 'px' });
                this.setStyle(btnSE, { left: btnX + 'px' });
                break;
            case 'resize-frame bottom-right':
                btnX = left - 10;
                btnY = top - 10;
                x = left;
                y = top;
                w = btnX - this.getNumber(leftBorder.style.left) + 10;
                h = btnY - this.getNumber(topBorder.style.top) + 10;
                this.setStyle(topBorder, { width: w + "px" });
                this.setStyle(rightBorder, { left: x + 'px', height: h + "px" });
                this.setStyle(bottomBorder, { top: y + 'px', width: w + "px" });
                this.setStyle(leftBorder, { height: h + "px" });

                this.setStyle(btnSE, { left: btnX + 'px', top: btnY + 'px' });
                this.setStyle(btnSW, { top: btnY + 'px' });
                this.setStyle(btnNE, { left: btnX + 'px' });
                break;
            case 'resize-frame bottom-left':
                btnX = left - 20;
                btnY = top - 20;
                x = left;
                y = top;
                w = this.getNumber(rightBorder.style.left) - btnX - 20;
                h = btnY - this.getNumber(topBorder.style.top) + 20;
                this.setStyle(topBorder, { left: x + 'px', width: w + "px" });
                this.setStyle(rightBorder, { height: h + "px" });
                this.setStyle(bottomBorder, { left: x + 'px', top: y + 'px', width: w + "px" });
                this.setStyle(leftBorder, { left: x + 'px', height: h + "px" });

                this.setStyle(btnSW, { left: btnX + 'px', top: btnY + 'px' });
                this.setStyle(btnSE, { top: btnY + 'px' });
                this.setStyle(btnNW, { left: btnX + 'px' });
                break;
        }
        //return {x: btnX, y: btnY}
    }

    public findFirstScrollable(element: HTMLElement): HTMLElement {
        if (this.isScrollable(element)) return element;

        let parent = element.parentElement;
        while(parent && !this.isScrollable(parent)) {
            parent = parent.parentElement;
        }
        if (parent) {
            if (parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
                return parent;
            }
        }
        return null;
    }

    private isScrollable(el: HTMLElement): boolean {
        const hasScrollableContent = el.scrollHeight > el.clientHeight;

        // It's not enough because the element's `overflow-y` style can be set as
        // * `hidden`
        // * `hidden !important`
        // In those cases, the scrollbar isn't shown
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;
        return hasScrollableContent && !isOverflowHidden;
    }

    private getNumber(pos: string): number {
        const value = Number(pos.replace('px', ''))
        if (!isNaN(value)) {
            return value;
        }
        return 0;
    }

    public removeResizeFrame() {
        this.document.querySelectorAll(".resize-frame,.resizer,.btn-trash,.angular-editor-table-utility").forEach((item) => item.parentNode.removeChild(item));
    }

    private getToolbarTable(): HTMLElement {
        const div = this.createDOM('div', 'angular-editor-table-utility', {});
        // TABLE
        let tool = this.createDOM('div', 'angular-editor-toolbar-set', {});
        let btn = this.createDOM('button', 'angular-editor-button button-table remove-table', {});
        let content = this.createDOM('i', 'fa fa-remove', {});
        btn.appendChild(content);
        tool.appendChild(btn);
        div.appendChild(tool);

        // ROW
        tool = this.createDOM('div', 'angular-editor-toolbar-set', {});
        btn = this.createDOM('button', 'angular-editor-button button-table insert-row-before', {});
        content = this.createDOM('i', 'fa fa-caret-square-o-up', {});
        btn.appendChild(content);
        tool.appendChild(btn);

        btn = this.createDOM('button', 'angular-editor-button button-table insert-row-after', {});
        content = this.createDOM('i', 'fa fa-caret-square-o-down', {});
        btn.appendChild(content);
        tool.appendChild(btn);

        btn = this.createDOM('button', 'angular-editor-button button-table remove-row', {});
        content = this.createDOM('i', 'fa fa-remove', {});
        btn.appendChild(content);
        tool.appendChild(btn);

        div.appendChild(tool);

        // COL
        tool = this.createDOM('div', 'angular-editor-toolbar-set', {});
        btn = this.createDOM('button', 'angular-editor-button button-table insert-col-before', {});
        content = this.createDOM('i', 'fa fa-caret-square-o-up', {});
        btn.appendChild(content);
        tool.appendChild(btn);

        btn = this.createDOM('button', 'angular-editor-button button-table insert-col-after', {});
        content = this.createDOM('i', 'fa fa-caret-square-o-down', {});
        btn.appendChild(content);
        tool.appendChild(btn);

        btn = this.createDOM('button', 'angular-editor-button button-table remove-col', {});
        content = this.createDOM('i', 'fa fa-remove', {});
        btn.appendChild(content);
        tool.appendChild(btn);
        div.appendChild(tool);
        return div;
    }

    private getResizeButton(x: number, y: number, css: string, color: string): HTMLElement {
        const cursor = css === 'top-right' || css === 'bottom-left' ? 'sw-resize' : 'se-resize';
        return this.createDOM('span', 'resize-frame ' + css, {
            margin: '10px',
            position: 'absolute',
            top: y + 'px',
            left: x + 'px',
            border: 'solid 3px ' + color,
            'border-radius': '6px',
            width: '6px',
            height: '6px',
            cursor: cursor,
            'box-sizing': 'content-box',
            zIndex: 1
        });
    }

    private getTrashButton(x: number, y: number, color: string): HTMLElement {
        return this.createDOM('span', 'btn-trash fa fa-trash-o', {
            margin: '10px',
            position: 'absolute',
            top: y + 'px',
            left: x + 'px',
            color: color,
            border: 'solid 1px ' + color,
            background: '#fff',
            'border-radius': '3px',
            'font-size': '15px',
            'box-sizing': 'content-box',
            padding: '2px 0 0 4px',
            width: '16px',
            height: '18px',
            cursor: 'pointer',
            zIndex: 1
        });
    }

    private getResizeBorder(x: number, y: number, w: number, h: number, css: string, color: string): HTMLElement {
        return this.createDOM('span', css, {
            position: 'absolute',
            top: (y) + 'px',
            left: (x) + 'px',
            border: 'dashed 1px ' + color,
            width: w + 'px',
            height: h + 'px'
        });
    }

    private createDOM(elementType: string, className: string, styles: any) {
        let ele = this.document.createElement(elementType);
        ele.className = className;
        this.setStyle(ele, styles);
        return ele;
    }

    public setStyle(ele: HTMLElement, styles: any) {
        for (let key in styles) {
            ele.style[key] = styles[key];
        }
        return ele;
    }
}
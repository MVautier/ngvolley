import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CustomClass} from './config';
import { UndoManagerService } from './undo-manager.service';
import { UndoItem } from '../../lib/models/undo-item.model';
import { UtilService } from './util.service';
import { HtmlNode } from '../../lib/models/html-node.model';
import { BehaviorSubject } from 'rxjs';
import { DomService } from './dom.service';

export interface UploadResponse {
  imageUrl: string;
}

@Injectable()
export class EditorService {

  savedSelection: Range | null;
  selectedText: string;
  uploadUrl: string;
  uploadWithCredentials: boolean;
  token: string;
  currentNode: HTMLElement;
  currentSelection: Selection;
  userSelection: Range;
  userSelectedText: string;
  public actionExecuted: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  forbiddenTags = ['style', 'meta', 'script'];
  defaultParagraphSeparator = 'div';
  document: any;
  public selectedImage: HTMLImageElement;

  constructor(
    private http: HttpClient,
    private undoManager: UndoManagerService,
    private util: UtilService,
    private domService: DomService
  ) { }

  public surveyKeyboard(editor: HTMLElement) {
    if (this.currentSelection.rangeCount) {
      let container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
      if (container !== this.currentNode) {
        this.currentNode = container;
        const originalContent = container.innerHTML;
        if (container && container.nodeType !== 3) {
          this.bindKeyup(editor, originalContent);
        }
      }
    }
  }

  public bindKeyup (editor: HTMLElement, content: string) {
    if (this.currentNode) {
      editor.onkeyup = () => {
        if (this.currentNode.innerHTML !== content) {
          this.addUndoByContainerAndHtml(this.currentNode, content);
          content = this.currentNode.innerHTML;
        }
      };
      editor.onblur = () => {
        editor.onkeyup = null;
      }
    }
  }

  public selectImage(img: HTMLImageElement) {
    if (this.currentSelection) {
      const range = document.createRange();
      range.selectNodeContents(img);
      this.currentSelection.removeAllRanges();
      this.currentSelection.addRange(range);
    }
  }

  public execute(command: string, value?: any) {
    try {
      if (this.selectedImage) {
        this.domService.removeResizeFrame();
        this.selectedImage = null;
      }
      if (this.util.headings.includes(command)) {
        //this.setHeading(command);
        if (command === 'default') {
          command = this.defaultParagraphSeparator;
        }
        this.removeTag(command);
        this.formatAndSetSelection(command);
      } else {
        switch (command) {
          case 'undo':
            this.undoManager.undo();
            break;
          case 'redo':
            this.undoManager.redo();
            break;
          case 'bold':
            this.formatAndSetSelection('b');
            break;
          case 'italic':
            this.formatAndSetSelection('em');
            break;
          case 'underline':
            this.formatAndSetSelection('u');
            break;
          case 'strikeThrough':
            this.formatAndSetSelection('s');
            break;
          case 'subscript':
            this.formatAndSetSelection('sub');
            break;
          case 'superscript':
            this.formatAndSetSelection('sup');
            break;
          case 'justifyLeft':
          case 'justifyCenter':
          case 'justifyRight':
          case 'justifyFull':
            this.justifyParagraph(command);
            break;
          case 'indent':
          case 'outdent':
            this.indentOutdent(command === 'indent');
            break;
          case 'insertUnorderedList':
          case 'insertOrderedList':
            this.insertList(command === 'insertOrderedList');
            break;
          case 'fontName':
            this.setFontAttribute('font-family', value)
            break;
          case 'fontSize':
            this.setFontAttribute('font-size', value)
            break;
          case 'textColor':
              this.setFontAttribute('color', value)
              break;
          case 'backgroundColor':
            this.setFontAttribute('background', value)
            break;
          case 'removeFormat':
            this.removeFormat();
            break;
          case 'insertHorizontalRule':
            this.insertHTML({
              tagName: 'hr'
            });
            break;
          case 'insertText':
            this.insertText({
              tagName: 'span',
              textContent: value
            });
            break;
          case 'insertHTML':
            this.insertHTML(value);
            break;
          case 'unlink':
            console.log('unlink request');
            this.removeSurroundingTag('a');
            break;
        }
      }
      this.actionExecuted.next(command);
    } catch (err) {
      console.log('error on executing command ' + command, err);
    }
  }

  public setFontAttribute(attribute: string, value: string) {
    //if (attribute === 'color' || attribute === 'background') {
      this.restoreUserSelection();
    //}
    const selected = this.currentSelection.toString();
    const container = this.util.getParentContainerForFont(this.currentSelection.focusNode as HTMLElement);
    let originalContent = container.innerHTML;
    let styleModified = false;
    const node = this.getFirstParentOfText(this.currentSelection.focusNode as HTMLElement);
    const styleAttribute = this.getStyleAttribute(attribute);
    if (node.nodeName === 'SPAN') {
      switch (attribute) {
        case 'background':
          node.style.background = value;
          break;
          case 'color':
          node.style.color = value;
          break;
          case 'font-size':
          node.style.fontSize = value;
          break;
          case 'font-family':
          node.style.fontFamily = value;
          break;
      }
      // if (attribute === 'background') {
      //   node.style.background = value;
      // } else {
      //   const attr = node.attributes.getNamedItem(attribute);
      //   if (attr) {
      //     attr.value = value;
      //   } else {
      //     node.setAttribute(attribute, value);
      //   }
      // }
    } else if (selected && this.currentSelection.focusNode.nodeType === 3) {
      const startOffset = this.getBaseOffset();
      if (this.currentSelection.focusNode.previousSibling) {
        let html = '';
        for (let i = 0; i < node.childNodes.length; i++) {
          const n = node.childNodes[i];
          let content = '';
          if (n !== this.currentSelection.focusNode) {
            content = n.nodeType === 3 ? n.nodeValue : (n as HTMLElement).outerHTML;
            html += content;
          } else {
            const v = this.currentSelection.focusNode.nodeValue;
            const start = v.substring(0, startOffset);
            const text = v.substring(startOffset, this.currentSelection.focusOffset);
            const end = v.substring(this.currentSelection.focusOffset);
            const style = ' style="' + attribute + ':' + value + ';"';
            html += start + '<span ' + style + '>' + text + '</span>' + end;
          }
        }
        node.innerHTML = html;
      } else {
        const html = node.innerHTML;
        const start = html.substring(0, startOffset);
        const text = html.substring(startOffset, this.currentSelection.focusOffset);
        const end = html.substring(this.currentSelection.focusOffset);
        const style = ' style="' + attribute + ':' + value + ';"';
        node.innerHTML = start + '<span ' + style + '>' + text + '</span>' + end;
      }
    } else {
      container.innerHTML = this.util.removeAllTags(container, 'span');
      originalContent = node.style[styleAttribute];
      node.style[styleAttribute] = value;
      styleModified = true;
    }
    const undoItem: UndoItem = {
      element: container,
      originalContent: originalContent,
      newContent: styleModified ? value : container.innerHTML,
      undo: (element: HTMLElement, content: string) => {
        this.apply(element, content, styleAttribute, styleModified);
      },
      redo: (element: HTMLElement, content: string) => {
        this.apply(element, content, styleAttribute, styleModified);
      }
    };
    this.undoManager.addItem(undoItem);
  }

  apply(element: HTMLElement, content: string, styleAttribute: string, styleModified: boolean) {
    if (styleModified) {
      element.style[styleAttribute] = content;
    } else {
      element.innerHTML = content;
    }
  }

  getBaseOffset(): number {
    let offset = (this.currentSelection as any).baseOffset || (this.currentSelection as any).anchorOffset || 0;
    return Number(offset);
  }

  public setDefaultParagraphSeparator(separator: string) {
    this.defaultParagraphSeparator = separator;
    // Deprecated execCommand
    //this.document.execCommand('defaultParagraphSeparator', false, separator);
  }

  /**
   * Create URL link
   * @param customClass object CustomClass
   */
  public createCustomClass(customClass: CustomClass) {
    if (customClass) {
      this.execute('insertHTML',{
        tagName: customClass.tag ? customClass.tag : 'span',
        textContent: this.selectedText,
        className: customClass.class
      });
    } else {
      this.execute('insertHTML',{
        tagName: 'span',
        textContent: this.selectedText
      });
    }
  }

  public insertText(htmlNode: HtmlNode): boolean {
    var sel: Selection, range: Range;
    if (this.document.getSelection && (sel = this.document.getSelection()).rangeCount) {
      let container = this.util.getParentContainer(sel.focusNode as HTMLElement);
      let originalContent = container.innerHTML;
        range = sel.getRangeAt(0);
        let startOffset = -1;
        let surroundNode = false;
        if (range.startOffset >= 0 && range.endOffset && range.endOffset > range.startOffset) {
          if (sel.focusNode.nodeType === 3) {
            startOffset = range.startOffset;
            const html = sel.focusNode.nodeValue;
            const start = html.substring(0, sel.anchorOffset);
            const end = html.substring(sel.focusOffset);
            sel.focusNode.nodeValue = start + ' ' + end;
          } else {
            surroundNode = true;
          }
        }
        const el = this.document.createTextNode(htmlNode.textContent);
        if (surroundNode) {
          range.surroundContents(el);
        } else {
          if (startOffset >= 0) {
            range.setStart(sel.focusNode, startOffset);
          }
          range.insertNode(el);
        }
        range.setStartAfter(el);
        this.addUndoByContainerAndHtml(container, originalContent);
        return true;
    }
    return false;
  }

  public insertHTML(htmlNode: HtmlNode): boolean {
    var sel: Selection, range: Range;
    if (this.document.getSelection && (sel = this.document.getSelection()).rangeCount) {
      let container = this.util.getParentContainer(sel.focusNode as HTMLElement);
      let originalContent = container.innerHTML;
        range = sel.getRangeAt(0);
        let startOffset = -1;
        let surroundNode = false;
        if (range.startOffset >= 0 && range.endOffset && range.endOffset > range.startOffset) {
          if (sel.focusNode.nodeType === 3) {
            startOffset = range.startOffset;
            const html = sel.focusNode.nodeValue;
            const start = html.substring(0, sel.anchorOffset);
            const end = html.substring(sel.focusOffset);
            sel.focusNode.nodeValue = start + ' ' + end;
          } else {
            surroundNode = true;
          }
        }
        const el = this.document.createElement(htmlNode.tagName);
        if (htmlNode.tagName === 'div' && htmlNode.divHtml) {
          el.innerHTML = htmlNode.divHtml;
        } else {
          if (htmlNode.textContent) {
            el.appendChild(this.document.createTextNode(htmlNode.textContent) );
          }
          if (htmlNode.className) {
            el.className = htmlNode.className;
          }
          if (htmlNode.href) {
            (el as HTMLLinkElement).href = htmlNode.href;
            (el as HTMLLinkElement).target = '_blank';
          }
          if (htmlNode.src) {
            (el as HTMLImageElement).src = htmlNode.src;
          }
          if (htmlNode.title) {
            (el as HTMLImageElement).title = htmlNode.title;
          }
        }
        if (htmlNode.styles && htmlNode.styles.length) {
          htmlNode.styles.forEach(style => {
            el.style[style.property] = style.value;
          });
        }
        
        if (surroundNode) {
          range.surroundContents(el);
        } else {
          if (startOffset >= 0) {
            range.setStart(sel.focusNode, startOffset);
          }
          range.insertNode(el);
        }
        
        range.selectNodeContents(el);
        this.addUndoByContainerAndHtml(container, originalContent);
        return true;
    }
    return false;
  }

  /**
   * Create URL link
   * @param url string from UI prompt
   */
  public createLink(url: string) {
    this.execute('insertHTML',{
      tagName: 'a',
      href: url,
      textContent: this.selectedText
    });
  }

  /**
   * Upload file to uploadUrl
   * @param file The file
   */
  public uploadImage(file: File): Promise<any> {
    const uploadData: FormData = new FormData();
    uploadData.append('file', file, file.name);
    var headers: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + this.token
    });
    return this.http.post<any>(this.uploadUrl, uploadData, {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      withCredentials: this.uploadWithCredentials
    }).toPromise();
  }

  /**
   * Insert image with Url
   * @param imageUrl The imageUrl.
   */
  public insertImage(imageUrl: string) {
    this.execute('insertHTML',{
      tagName: 'img',
      src: imageUrl,
      title: this.selectedText
    });
  }

  /**
   * Insert video
   * @param videoUrl string from UI prompt
   */
  public insertVideo(videoUrl: string) {
    // test values : https://www.youtube.com/watch?v=PkwvvO9icm0
    if (videoUrl.match('www.youtube.com')) {
      this.insertYouTubeVideoTag(videoUrl);
    }
    if (videoUrl.match('vimeo.com')) {
      this.insertVimeoVideoTag(videoUrl);
    }
  }

  public removeSelectedElements(tagNames: string) {
    const tagNamesArray = tagNames.toLowerCase().split(',');
    this.getSelectedNodes().forEach((node) => {
      if (node.nodeType === 1 &&
        tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
        // Remove the node and replace it with its children
        this.replaceWithOwnChildren(node);
      }
    });
  }

  public saveUserSelection = (): void => {
    if (this.document.getSelection) {
      const sel = this.document.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0) as Range;
        if (this.isRangeValid(range)) {
          this.userSelection = range;
          this.userSelectedText = sel.toString();
        }
      }
    } else if (this.document.getSelection && this.document.createRange) {
      this.savedSelection = document.createRange();
    } else {
      this.savedSelection = null;
    }
  }

  public restoreUserSelection(): void {
    if (this.userSelection && this.currentSelection) {
      this.currentSelection.removeAllRanges();
      this.currentSelection.addRange(this.userSelection);
    }
  }

  /**
  * save selection when the editor is focussed out
  */
  public saveSelection = (): void => {
    if (this.document.getSelection) {
      const sel = this.document.getSelection();
      if (sel && sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0) as Range;
        if (this.isRangeValid(range)) {
          this.savedSelection = range;
          this.selectedText = sel.toString();
        }
      }
    } else if (this.document.getSelection && this.document.createRange) {
      this.savedSelection = document.createRange();
    } else {
      this.savedSelection = null;
    }
  }

  private isRangeValid(range: Range): boolean {
    if (range.startContainer) {
      if (range.startContainer.nodeType === 3) {
        // if (range.startContainer.parentNode && this.forbiddenTags.includes(range.startContainer.parentNode.nodeName.toLowerCase())) {
        //   return false;
        // }
        return true;
      } else {
        const className = (range.startContainer as HTMLElement).className;
        if (!className.includes('circle') 
          && !className.includes('opened')
          && !className.includes('angular-editor-textarea')) {
          return true;
        }
      }
    }
    return false;
  }

  
  /**
   * restore selection when the editor is focused in
   */
   public restoreSelection(): boolean {
    if (this.savedSelection) {
      if (this.document.getSelection) {
        const sel = this.document.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
        this.currentSelection = sel;
        return true;
      } else if (this.document.getSelection /*&& this.savedSelection.select*/) {
        // this.savedSelection.select();
        return true;
      }
    } else {
      return false;
    }
  }

  // public saveUserSelection(): void {
  //   // if (this.currentSelection) {
  //   //   const sel = this.currentSelection;
  //   //   if (sel.getRangeAt && sel.rangeCount) {
  //   //     this.userSelection = sel.getRangeAt(0);
  //   //     this.userSelectedText = sel.toString();
  //   //   }
  //   // }
  //   if (this.savedSelection) {
  //     this.userSelection = this.savedSelection;
  //     this.userSelectedText = this.selectedText;
  //   }
  // }

  /**
   * setTimeout used for execute 'saveSelection' method in next event loop iteration
   */
  public executeInNextQueueIteration(callbackFn: (...args: any[]) => any, timeout = 1e2): void {
    setTimeout(callbackFn, timeout);
  }

  /** check any selection is made or not */
  private checkSelection(): any {
    const selectedText = this.savedSelection.toString();
    if (selectedText.length === 0) {
      throw new Error('No Selection Made');
    }
    return true;
  }

  private removeFormat() {
    const container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
    const originalContent = container ? container.innerHTML : '';
    const text = container.innerText;
    container.innerHTML = text;
    this.addUndoByContainerAndHtml(container, originalContent);
  }

  removeTag(tagName: string) {
    const range = document.createRange();
    const tagNames = this.util.headings.filter(h => h !== tagName);
    const ids = this.util.getSimilarTagsByList(this.currentSelection.focusNode, tagNames);
    if (ids && ids.length) {
      var child = this.unSurroundContent(ids[0]);
      range.selectNodeContents(child);
      this.currentSelection.removeAllRanges();
      this.currentSelection.addRange(range);
    }
  }

  private formatAndSetSelection(tagName: string) {
    const range = document.createRange();
    const ids = this.util.getSimilarTags(this.currentSelection.focusNode, tagName);
    const container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
    const originalContent = container ? container.innerHTML : '';
    const hasCurrentTagName = this.currentSelection.focusNode && (this.currentSelection.focusNode as HTMLElement).id !== undefined && (this.currentSelection.focusNode as HTMLElement).id.startsWith(tagName);
    if (hasCurrentTagName || ids.length) {
      // remove previous added tagName
      var child = this.unSurroundContent(hasCurrentTagName ? (this.currentSelection.focusNode as HTMLElement).id : ids[0]);
      range.selectNodeContents(child);
      this.currentSelection.removeAllRanges();
      this.currentSelection.addRange(range);
    } else {
      // englobe with tagName
      const newParent = document.createElement(tagName);
      newParent.id = this.util.getUniqueId(tagName);
      const node = this.currentSelection.focusNode;
      range.selectNodeContents(node);
      const start = this.getBaseOffset();
      const end = this.currentSelection.focusOffset;
      if (start !== end) {
        range.setStart(node, start > end ? end : start);
        range.setEnd(node, end > start ? end : start);
      }
      range.surroundContents(newParent);
      range.selectNodeContents(newParent.firstChild ? newParent.firstChild : newParent);
      this.currentSelection.removeAllRanges();
      this.currentSelection.addRange(range);
    }
    this.addUndoByContainerAndHtml(container, originalContent);
  }

  private justifyParagraph(justify: string) {
    const container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
    if (container) {
      const style = this.util.getStyleProperty(container, 'textAlign');
      const originalContent = style ? style : 'left';
      switch(justify) {
        case 'justifyLeft':
          container.style.textAlign = 'left';
          break;
        case 'justifyCenter':
          container.style.textAlign = 'center';
          break;
        case 'justifyRight':
          container.style.textAlign = 'right';
          break;
        case 'justifyFull':
          container.style.textAlign = 'justify';
          break;
      }
      const undoItem: UndoItem = {
        element: container,
        originalContent: originalContent,
        newContent: container.style.textAlign,
        undo: (element: HTMLElement, content: string) => {
          element.style.textAlign = content;
        },
        redo: (element: HTMLElement, content: string) => {
          element.style.textAlign = content;
        }
      };
      this.undoManager.addItem(undoItem);
    }
  }

  private indentOutdent(indent: boolean) {
    const container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
    if (container) {
      const style = getComputedStyle(container);
      const px = style && style['paddingLeft'] ? Number(style['paddingLeft'].replace('px', '')) : 0;
      const apply = indent ? px < 60 : px >= 0;
      if (apply) {
        const newPx = (indent ? (px + 6) : (px - 6));
        container.style['paddingLeft'] = newPx + 'px';
        const undoItem: UndoItem = {
          element: container,
          originalContent: px + 'px',
          newContent: newPx + 'px',
          undo: (element: HTMLElement, content: string) => {
            container.style['paddingLeft'] = content;
          },
          redo: (element: HTMLElement, content: string) => {
            container.style['paddingLeft'] = content;
          }
        };
        this.undoManager.addItem(undoItem);
      }
    }
  }

  private indentOutdent_old(indent: boolean) {
    const container = this.util.getParentContainer(this.currentSelection.focusNode as HTMLElement);
    if (container) {
      const classNames = container.className?.split(' ') || [];
      let value = classNames.find(c => c.startsWith('indent-'));
      if (!value) {
        value = 'indent-0';
      }
      const index = Number(value.replace('indent-', ''));
      const apply = indent ? index < 8 : index >= 0;
      if (apply) {
        const newValue = 'indent-' + (indent ? (index + 1) : (index - 1));
        container.classList.remove(value);
        if (newValue !== 'indent-0') {
          container.classList.add(newValue);
        }
        const undoItem: UndoItem = {
          element: container,
          originalContent: value,
          newContent: newValue,
          undo: (element: HTMLElement, content: string) => {
            element.classList.remove(newValue);
            if (content !== 'indent-0') {
              element.classList.add(content);
            }
          },
          redo: (element: HTMLElement, content: string) => {
            element.classList.remove(value);
            if (content !== 'indent-0') {
              element.classList.add(content);
            }
          }
        };
        this.undoManager.addItem(undoItem);
      }
    }
  }

  private insertList(ordered: boolean) {
    let node = this.currentSelection.focusNode as HTMLElement;
    if (node.nodeType === 3 && node.parentElement) {
      node = node.parentElement;
    }
    const container = this.util.getParentContainer(node);
    const listTag = ordered ? 'ol' : 'ul';
    if (container) {
      const originalContent = container.innerHTML;
      const range = document.createRange();
      if (node.tagName !== 'LI') {
        const li = document.createElement('li');
        range.selectNodeContents(this.currentSelection.focusNode);
        range.surroundContents(li);
        range.selectNode(li);
        const list = document.createElement(listTag);
        range.surroundContents(list);
      } else {
        let parent = node.parentNode as HTMLElement;
        const list = parent && parent.nodeName.toLowerCase() === listTag ? parent : node;
        const text = list.outerHTML
          .replace(/((<ul>|<ol>)|<li>((.|\n)*)<\/li>|(<\/ul>|<\/ol>))/g, '$3')
          .replace(/<\/li><li>/g, '')
          .replace(/\n*/gm, '');
        container.innerHTML = container.innerHTML.replace(list.outerHTML, text);
      }
      this.addUndoByContainerAndHtml(container, originalContent);
    }
  }

  // private setHeading( command: string) {
  //   let node = this.currentSelection.focusNode as HTMLElement;
  //   let container = this.util.getParentContainer(node);
  //   let originalContent = container.innerHTML;
  //   if (this.util.headings.includes(container.tagName.toLowerCase()) && container.parentElement) {
  //     const outer = container.nodeType === 3 ? container.nodeValue : container.outerHTML;
  //     const inner = container.nodeType === 3 ? container.nodeValue : container.innerHTML;
  //     container = container.parentElement;
  //     originalContent = container.innerHTML;
  //     if (outer !== inner) {
  //       container.innerHTML = container.innerHTML.replace(outer, inner);
  //     }
  //   }
  //   if (command !== 'default') {
  //     container.innerHTML = '<' + command + '>' + container.innerHTML + '</' + command + '>';
  //   }
  //   const range = document.createRange();
  //   range.selectNodeContents(this.currentSelection.focusNode.firstChild);
  //   this.currentSelection.removeAllRanges();
  //   this.currentSelection.addRange(range);
  //   this.addUndoByContainerAndHtml(container, originalContent);
  // }

  private removeSurroundingTag(tagName: string) {
    let node = this.currentSelection.focusNode as HTMLElement;
    if (node) {
      var parent = this.findParent(node, tagName); // node.parentNode;
      if (parent) {
        const container = this.util.getParentContainer(node);
        const originalContent = container.innerHTML;
        parent.insertAdjacentHTML('afterend', parent.innerHTML);
        parent.remove();
        this.addUndoByContainerAndHtml(container, originalContent);
      }
      
    }
  }

  private findParent(node: HTMLElement, tagName: string): HTMLElement {
    let parent = node.parentElement;
    while(parent && parent.id !== 'ngEditor') {
      if (parent.tagName.toLowerCase() === tagName) {
        break;
      }
      parent = parent.parentElement;
    }
    return parent;
  }

  private unSurroundContent(tagId: string): Node {
    var node = this.document.getElementById(tagId);
    const tagName = tagId.split('-')[0];
    this.removeSimilarTags(node, tagName);    
    var parent = node.parentNode;
    let child;
    while(node.firstChild) {
      var inserted = parent.insertBefore(node.firstChild, node) as HTMLElement;
      if (inserted.firstChild) {
        child = inserted.firstChild;
      } else {
        child = inserted;
      }
    }
    parent.removeChild(node);
    return child;
  }

  private removeSimilarTags(node: any, tagName: string) {
    const ids = this.util.getSimilarTags(node, tagName);
    ids.forEach(id => { this.unSurroundContent(id); });
  }

  private getStyleAttribute(attribute: string): string {
    let result = '';
    switch(attribute) {
      case 'face': 
        result = 'fontFamily';
        break;
      case 'size': 
        result = 'fontSize';
        break;
      default: 
        result = attribute;
        break;
    }
    return result;
  }

  private getFirstParentOfText(node: HTMLElement): HTMLElement {
    let current = node;
    while (current.nodeType === 3) {
      current = current.parentElement;
    }
    return current;
  }

  private hasSelectedText(): boolean {
    const node = this.currentSelection.focusNode;
    const startOffset = this.getBaseOffset();
    if (node.nodeType === 3 && startOffset >= 0 && this.currentSelection.focusOffset > 0 && this.currentSelection.focusOffset > startOffset) {
      return true;
    }
    return false;
  }

  private addUndoByContainerAndHtml(container: HTMLElement, originalContent: string) {
    const undoItem: UndoItem = {
      element: container,
      originalContent: originalContent,
      newContent: container ? container.innerHTML : '',
      undo: (element: HTMLElement, content: string) => {
        element.innerHTML = content;
      },
      redo: (element: HTMLElement, content: string) => {
        element.innerHTML = content;
      }
    };
    this.undoManager.addItem(undoItem);
  }

  private insertYouTubeVideoTag(videoUrl: string): void {
    // https://www.youtube.com/watch?v=PkwvvO9icm0
    const id = videoUrl.split('v=')[1];
    const imageUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
    //<img style='position: absolute; left:200px; top:140px' src="https://img.icons8.com/color/96/000000/youtube-play.png"/>
    //<img style='position: absolute; left:42%; top:39%' src="https://img.icons8.com/color/96/000000/youtube-play.png"/>
    const thumbnail = `
          <a href='${videoUrl}' target='_blank'>
            <img src="${imageUrl}" alt="click to watch"/>
          </a>`;
    this.execute('insertHTML',{
      tagName: 'div',
      styles: [{property: 'position', value: 'relative'}],
      divHtml: thumbnail
    });
  }

  private insertVimeoVideoTag(videoUrl: string): void {
    const sub = this.http.get<any>(`https://vimeo.com/api/oembed.json?url=${videoUrl}`).subscribe(data => {
      const imageUrl = data.thumbnail_url_with_play_button;
      const thumbnail = `
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="${data.title}"/>
        </a>`;
        this.execute('insertHTML',{
          tagName: 'div',
            divHtml: thumbnail
        });
      sub.unsubscribe();
    });
  }

  private nextNode(node) {
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
      }
      if (!node) {
        return null;
      }
      return node.nextSibling;
    }
  }

  private getRangeSelectedNodes(range, includePartiallySelectedContainers) {
    let node = range.startContainer;
    const endNode = range.endContainer;
    let rangeNodes = [];

    // Special case for a range that is contained within a single node
    if (node === endNode) {
      rangeNodes = [node];
    } else {
      // Iterate nodes until we hit the end container
      while (node && node !== endNode) {
        rangeNodes.push( node = this.nextNode(node) );
      }

      // Add partially selected nodes at the start of the range
      node = range.startContainer;
      while (node && node !== range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
      }
    }

    // Add ancestors of the range container, if required
    if (includePartiallySelectedContainers) {
      node = range.commonAncestorContainer;
      while (node) {
        rangeNodes.push(node);
        node = node.parentNode;
      }
    }

    return rangeNodes;
  }

  private getSelectedNodes() {
    const nodes = [];
    if (this.currentSelection) {
      for (let i = 0, len = this.currentSelection.rangeCount; i < len; ++i) {
        nodes.push.apply(nodes, this.getRangeSelectedNodes(this.currentSelection.getRangeAt(i), true));
      }
    }
    return nodes;
  }

  private replaceWithOwnChildren(el) {
    const parent = el.parentNode;
    while (el.hasChildNodes()) {
      parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
  }
}
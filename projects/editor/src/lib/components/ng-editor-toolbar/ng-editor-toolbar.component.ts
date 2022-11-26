import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Renderer2
} from '@angular/core';
import {EditorService} from '../../services/editor.service';
import {CustomClass} from '../../services/config';
import {SelectOption} from '../ng-select/ng-select.component';
import { CustomButton } from '../../../lib/models/custom-button.model';
import { Command } from '../../../lib/models/command.model';
import { CustomSelect } from '../../../lib/models/custom-select.model';
import { UndoManagerService } from '../../../lib/services/undo-manager.service';
import { TagMap } from '../../../lib/models/tag-map.model';
import { UtilService } from '../../../lib/services/util.service';

@Component({
  selector: 'ng-editor-toolbar',
  templateUrl: './ng-editor-toolbar.component.html',
  styleUrls: ['./ng-editor-toolbar.component.scss']
})

export class NgEditorToolbarComponent implements AfterViewInit {
  htmlMode = false;
  linkSelected = false;
  block = 'default';
  fontName = 'Times New Roman';
  fontSize = '3';
  foreColor: string = '#000000';
  backColor: string = '#ffffff';
  colorOpened = false;

  headings: SelectOption[] = [
    {
      label: 'Heading 1',
      value: 'h1',
    },
    {
      label: 'Heading 2',
      value: 'h2',
    },
    {
      label: 'Heading 3',
      value: 'h3',
    },
    {
      label: 'Heading 4',
      value: 'h4',
    },
    {
      label: 'Heading 5',
      value: 'h5',
    },
    {
      label: 'Heading 6',
      value: 'h6',
    },
    {
      label: 'Heading 7',
      value: 'h7',
    },
    {
      label: 'Paragraph',
      value: 'p',
    },
    {
      label: 'Predefined',
      value: 'pre'
    },
    {
      label: 'Standard',
      value: 'div'
    },
    {
      label: 'default',
      value: 'default'
    }
  ];

  fontSizes: SelectOption[] = [
    {
      label: '1',
      value: '10px',
    },
    {
      label: '2',
      value: '13px',
    },
    {
      label: '3',
      value: '16px',
    },
    {
      label: '4',
      value: '18px',
    },
    {
      label: '5',
      value: '24px',
    },
    {
      label: '6',
      value: '32px',
    },
    {
      label: '7',
      value: '48px',
    }
  ];

  customClassId = '-1';
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  _customClasses: CustomClass[];
  customClassList: SelectOption[] = [{label: '', value: ''}];
  // uploadUrl: string;

  tagMap = {
    //BLOCKQUOTE: 'indent',
    A: 'link'
  };

  select = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'DIV'];

  buttons = [
    'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 
    'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 
    'insertUnorderedList', 'insertOrderedList', 'link'];

  buttonsMap: TagMap[] = [
    {command: 'bold', tag: 'b'}, 
    {command: 'italic', tag: 'em'}, 
    {command: 'underline', tag: 'u'}, 
    {command: 'strikeThrough', tag: 's'}, 
    {command: 'subscript', tag: 'sub'}, 
    {command: 'superscript', tag: 'sup'}, 
    {command: 'justifyLeft', tag: 'style:textAlign:left'}, 
    {command: 'justifyCenter', tag: 'style:textAlign:center'}, 
    {command: 'justifyRight', tag: 'style:textAlign:right'}, 
    {command: 'justifyFull', tag: 'style:textAlign:justify'}, 
    {command: 'indent', tag: 'style:paddingLeft:indent'}, 
    //{command: 'outdent', tag: 'class:'}, 
    {command: 'insertUnorderedList', tag: 'ul'}, 
    {command: 'insertOrderedList', tag: 'ol'}, 
    {command: 'link', tag: 'a'}
  ];

  @Input() id: string;
  @Input() uploadUrl: string;
  @Input() upload: (file: File) => Promise<any>;
  @Input() showToolbar: boolean;
  @Input() showHistory: boolean = false;
  @Input() showColorInputText: boolean = false;
  @Input() fonts: SelectOption[] = [{label: '', value: ''}];
  @Input() customButtons: CustomButton[] = [];
  @Input() customSelects: CustomSelect[] = [];
  @Input() document: any;

  @Input()
  set customClasses(classes: CustomClass[]) {
    if (classes) {
      this._customClasses = classes;
      this.customClassList = this._customClasses.map((x, i) => ({label: x.name, value: i.toString()}));
      this.customClassList.unshift({label: 'Clear Class', value: '-1'});
    }
  }

  @Input()
  set defaultFontName(value: string) {
    if (value) {
      this.fontName = value;
    }
  }

  @Input()
  set defaultFontSize(value: string) {
    if (value) {
      this.fontSize = value;
    }
  }

  @Input() hiddenButtons: string[][];
  @Output() execute: EventEmitter<Command> = new EventEmitter<Command>();

  public get isLinkButtonDisabled(): boolean {
    return this.htmlMode || !Boolean(this.editorService.selectedText);
  }

  constructor(
    private r: Renderer2,
    private readonly changeDetector: ChangeDetectorRef,
    private editorService: EditorService,
    private undoManager: UndoManagerService,
    private util: UtilService
  ) { }

  ngAfterViewInit(): void {
    let colorPickerInputs = document.querySelectorAll('input[type=color]');
    if (colorPickerInputs)
      colorPickerInputs.forEach((input) => {
        input.setAttribute('style', 'position: absolute; top: 20px; opacity: 0;');
    });
    this.undoManager.init(this.showHistory);
    Array.from(document.querySelectorAll('.app-color-picker')).forEach(button => {
      (button as HTMLDivElement).onmouseup = () => {
        this.focus();
        this.colorOpened = true;
      }
    });
  }

  refresh() {
    this.changeDetector.detectChanges();
    setTimeout(() => {
      this.changeDetector.detectChanges();
    }, 100);
  }

  focus() {
    this.execute.emit({ name: 'focus'});
  }

  undo()  {
    this.execute.emit({ name: 'undo'});
  }

  redo() {
    this.execute.emit({ name: 'redo'});
  }

  canUndo(): boolean {
    return this.undoManager.canUndo();
  }

  canRedo(): boolean {
    return this.undoManager.canRedo();
  }

  /**
   * Trigger command from editor header buttons
   * @param command string from toolbar buttons
   */
  triggerCommand(command: string) {
    this.execute.emit({ name: command});
  }

  /**
   * set font Name/family
   * @param fontName string
   */
   setFontName(fontName: string): void {
    //this.editorService.setFontName(fontName);
    this.execute.emit({ name: 'fontName', value: fontName});
  }

  /**
   * set font Size
   * @param fontSize string
   */
  setFontSize(fontSize: string): void {
    //this.editorService.setFontSize(fontSize);
    this.execute.emit({ name: 'fontSize', value: fontSize});
  }

  /** insert color */
  insertColor(color: string, mode: string) {
    //this.editorService.insertColor(color, where);
    this.execute.emit({ name: mode, value: color});
  }

  onTextColorChange(color: any) {
    if (color && this.colorIsOpened()) {
      //console.log('text color changed: ', color);
      this.execute.emit({ name: 'textColor', value: color});
    }
  }

  onBgColorChange(color: any) {
    if (color && this.colorIsOpened()) {
      //console.log('background color changed: ', color);
      this.execute.emit({ name: 'backgroundColor', value: color});
    }
  }

  colorIsOpened(): boolean {
    const panel = document.getElementById('ngx-colors-overlay');
    if (panel) {
      const modal = panel.querySelector('.opened');
      if (modal) {
        const state = getComputedStyle(modal);
        return state.width !== '0px' && state.height !== '0px';
      }
    }
    return false;
  }

  /**
   * Set custom class
   */
   setCustomClass(classId: string) {
    if (classId === '-1') {
      this.execute.emit({ name: 'clear'});
    } else {
      this.editorService.createCustomClass(this._customClasses[+classId]);
    }
  }

  triggerCustomButton(command: Command) {
    if (command.action && typeof(command.action) === 'function') {
      command.action();
    } else {
      this.execute.emit(command);
    }
  }

  triggerCustomSelect(command: Command, value: string) {
    if (value) {
      command.value = value;
      this.execute.emit(command);
    }
  }

  /**
   * highlight editor buttons when cursor moved or positioning
   */
  triggerButtons() {
    if (!this.showToolbar) {
      return;
    }
    this.buttons.forEach(e => {
      //const result = this.doc.queryCommandState(e);
      const button = this.buttonsMap.find(b => b.command === e);
      if (button) {
        const result = button.tag.includes(':') ? this.isSelectionHasStyleOrClass(button.tag) : this.isSelectionInTag(button.tag);
        const elementById = document.getElementById(e + '-' + this.id);
        if (result) {
          this.r.addClass(elementById, 'active');
        } else {
          this.r.removeClass(elementById, 'active');
        }
      }
    });
  }

  isSelectionInTag(tag: string): boolean {
    // Get the current node
    let currentNode = this.editorService.currentSelection.focusNode as HTMLElement;
    // While the node is not the editor division
    while (currentNode && currentNode.id !== 'ngEditor')
    {
      // Check if the node is the requested tag
      if (currentNode.tagName && currentNode.tagName.toLowerCase() === tag) return true;
      // Move up in the tree
      currentNode = currentNode.parentNode as HTMLElement;		
    }
    return false;
  }

  isSelectionHasStyleOrClass(tag: string): boolean {
    const node = this.editorService.currentSelection.focusNode;
    if (node) {
      const container = this.util.getParentContainer(node as HTMLElement);
      const parsed = tag.split(':');
      const type = parsed[0];
      const property = parsed[1];
      const value = parsed[2];
      if (type === 'style') {
        const style = getComputedStyle(container);
        if (property === 'paddingLeft') {
          if (style[property] && style[property] !== '0px') return true;
        } else {
          if (style[property] && style[property] === value) return true;
        }
      } else if (type === 'class'){
        const css = container.className;
        if (css.includes(value)) return true;
      }
    }
    return false;
  }

  /**
   * trigger highlight editor buttons when cursor moved or positioning in block
   */
  public triggerBlocks(nodes: Node[]) {
    if (!this.showToolbar || !nodes.length) {
      return;
    }
    this.linkSelected = nodes.findIndex(x => x.nodeName === 'A') > -1;
    let found = false;
    this.select.forEach(y => {
      const node = nodes.find(x => x.nodeName === y);
      if (node !== undefined && y === node.nodeName) {
        if (found === false) {
          this.block = node.nodeName.toLowerCase();
          found = true;
        }
      } else if (found === false) {
        this.block = 'default';
      }
    });

    found = false;
    if (this._customClasses) {
      this._customClasses.forEach((y, index) => {
        const node = nodes.find(x => {
          if (x instanceof Element) {
            return x.className === y.class;
          }
        });
        if (node !== undefined) {
          if (found === false) {
            this.customClassId = index.toString();
            found = true;
          }
        } else if (found === false) {
          this.customClassId = '-1';
        }
      });
    }

    Object.keys(this.tagMap).map(e => {
      const elementById = document.getElementById(this.tagMap[e] + '-' + this.id);
      const node = nodes.find(x => x.nodeName === e);
      if (node !== undefined && e === node.nodeName) {
        this.r.addClass(elementById, 'active');
      } else {
        this.r.removeClass(elementById, 'active');
      }
    });

    this.setFontVariables();
    this.refresh();
  }

  private setFontVariables() {
    if (this.editorService.currentSelection && this.editorService.currentSelection.focusNode) {
      const element = this.util.getParentContainerForFont(this.editorService.currentSelection.focusNode as HTMLElement);
      const style = getComputedStyle(element);
      if (style) {
        if (style['color']) this.foreColor = style['color'];
        if (style['background']) this.backColor = style['background'];
        if (style['fontSize']) this.fontSize = this.translateFontSize(style['fontSize']);
        if (style['fontFamily']) this.fontName = this.translateFontName(style['fontFamily']);
      }
    }
  }

  private translateFontSize(size: string): string {
    let s = size;
    switch (size) {
      case '1':
        s = '10px';
        break;
      case '2':
        s = '13px';
        break;
      case '3':
        s = '16px';
        break;
      case '4':
        s = '18px';
        break;
      case '5':
        s = '24px';
        break;
      case '6':
        s = '32px';
        break;
      case '7':
        s = '48px';
        break;
    }
    return s;
  }

  private translateFontName(name: string): string {
    const font = name;
    if (!this.fonts.find(f => f.value === font)) {
      let liste = [].concat(this.fonts);
      liste.push({
        value: font,
        label: font
      });
      liste.sort((a: SelectOption, b: SelectOption) => {
        const va = a.label.toLowerCase().replace(/,|\s|-|"/gm, '');
        const vb = b.label.toLowerCase().replace(/,|\s|-|"/gm, '');
        return va > vb ? 1 : (va < vb ? -1 : 0);
      })
      this.fonts = [...liste];
    }
    return font;
  }

  /**
   * insert URL link
   */
  insertUrl() {
    let url = 'https:\/\/';
    const selection = this.editorService.savedSelection;
    if (selection && selection.commonAncestorContainer.parentElement.nodeName === 'A') {
      const parent = selection.commonAncestorContainer.parentElement as HTMLAnchorElement;
      if (parent.href !== '') {
        url = parent.href;
      }
    }
    url = prompt('Insert URL link', url);
    if (url && url !== '' && url !== 'https://') {
      this.editorService.createLink(url);
    }
  }

  /**
   * insert Video link
   */
  insertVideo() {
    this.execute.emit({ name: ''});
    const url = prompt('Insert Video link', `https://`);
    if (url && url !== '' && url !== `https://`) {
      this.editorService.insertVideo(url);
    }
  }

  /**
   * toggle editor mode (WYSIWYG or SOURCE)
   * @param m boolean
   */
  setEditorMode(m: boolean) {
    const toggleEditorModeButton = document.getElementById('toggleEditorMode' + '-' + this.id);
    if (m) {
      this.r.addClass(toggleEditorModeButton, 'active');
    } else {
      this.r.removeClass(toggleEditorModeButton, 'active');
    }
    this.htmlMode = m;
  }

  /**
   * Upload image when file is selected.
   */
  onFileChanged(event) {
    const file = event.target.files[0];
    if (file.type.includes('image/')) {
      if (this.upload) {
        this.upload(file).then(result => {
          this.onUpload(result, event);
        });
      } else if (this.uploadUrl) {
          this.editorService.uploadImage(file).then(result => {
            this.onUpload(result, event);
          });
      } else {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent) => {
          const fr = e.currentTarget as FileReader;
          this.editorService.insertImage(fr.result.toString());
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onUpload(result: any, event: any) {
    const imageUrl = result.body.files[0].url;
    this.editorService.insertImage(imageUrl);
    event.srcElement.value = null;
  }

  isButtonHidden(name: string): boolean {
    if (!name) {
      return false;
    }
    if (!(this.hiddenButtons instanceof Array)) {
      return false;
    }
    let result: any;
    for (const arr of this.hiddenButtons) {
      if (arr instanceof Array) {
        result = arr.find(item => item === name);
      }
      if (result) {
        break;
      }
    }
    return result !== undefined;
  }
}
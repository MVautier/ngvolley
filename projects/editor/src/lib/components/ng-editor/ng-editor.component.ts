import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectorRef,
  Component, ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../../../lib/components/ng-select/ng-select.component';
import { NgEditorToolbarComponent } from '../../../lib/components/ng-editor-toolbar/ng-editor-toolbar.component';
import { Command } from '../../../lib/models/command.model';
import { SafeHtmlPipe } from '../../../lib/pipes/safe-html.pipe';
import { EditorService } from '../../../lib/services/editor.service';
import { AngularEditorConfig, angularEditorConfig, Font } from '../../../lib/services/config';
import { ImageService } from '../../../lib/services/image.service';
import { UtilService } from '../../../lib/services/util.service';
import { FocusedItem } from '../../../lib/models/focused-item.model';
import { TableService } from '../../../lib/services/table.service';

@Component({
  selector: 'ng-editor',
  templateUrl: './ng-editor.component.html',
  styleUrls: ['./ng-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgEditorComponent),
      multi: true
    },
    //AngularEditorService
  ]
})
export class NgEditorComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {

  private onChange: (value: string) => void;
  private onTouched: () => void;

  modeVisual = true;
  showPlaceholder = false;
  disabled = false;
  focused = false;
  touched = false;
  changed = false;
  focusInstance: any;
  blurInstance: any;
  fonts: SelectOption[] = [];
  isSingleClick = false;
  tablePosition: {left: number, top: number, width: number, height: number};

  @Input() id = '';
  @Input() config: AngularEditorConfig = angularEditorConfig;
  @Input() placeholder = '';
  @Input() tabIndex: number | null;

  @Output() html: string;
  @Output() onModelChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() viewMode = new EventEmitter<boolean>();
  @Output() imageRemoved: EventEmitter<string> = new EventEmitter<string>();

  /** emits `blur` event when focused out from the textarea */
    // eslint-disable-next-line @angular-eslint/no-output-native, @angular-eslint/no-output-rename
  @Output('blur') blurEvent: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  /** emits `focus` event when focused in to the textarea */
    // eslint-disable-next-line @angular-eslint/no-output-rename, @angular-eslint/no-output-native
  @Output('focus') focusEvent: EventEmitter<FocusedItem> = new EventEmitter<FocusedItem>();

  //@ViewChild('editor', {static: true}) textArea: ElementRef;
  textArea: HTMLDivElement;
  @ViewChild('editorWrapper', {static: true}) editorWrapper: ElementRef;
  @ViewChild('toolbar') toolbar: NgEditorToolbarComponent;
  @ContentChild("customButtons") customButtonsTemplateRef?: TemplateRef<any>;
  executeCommandFn = this.executeCommand.bind(this);

  @ViewChild('ifrm') iframe: ElementRef;

  @HostBinding('attr.tabindex') tabindex = -1;

  @HostListener('focus')
  onFocus() {
    this.focus();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.initDomServices();
  }
  doc: any;

  initialized = false;

  constructor(
    private r: Renderer2,
    private editorService: EditorService,
    private imageService: ImageService,
    private tableService: TableService,
    //private undoManager: UndoManagerService,
    private util: UtilService,
    private safeHtml: SafeHtmlPipe,
    // private doc: any,
    //private sanitizer: DomSanitizer,
    private readonly changeDetector: ChangeDetectorRef,
    @Attribute('tabindex') defaultTabIndex: string,
    @Attribute('autofocus') private autoFocus: any
  ) {
    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
  }

  ngOnInit() {
    this.init();
    this.config.toolbarPosition = this.config.toolbarPosition ? this.config.toolbarPosition : angularEditorConfig.toolbarPosition;
  }

  initIframe(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      var iframe = document.getElementById( 'ifrm' ) as HTMLIFrameElement;
      // iframe.style.height = this.config.height;
      // iframe.style.minHeight = this.config.minHeight;
      // iframe.style.maxHeight = this.config.maxHeight;
      //iframe.attributes['scrollbar'] = 'no';
      iframe.style.marginBottom = '-4px';
      //var content = html; //document.getElementById("iframeContent").innerHTML;
      const div = document.createElement('div');
      div.id = 'ngEditor';
      div.contentEditable = 'true';
      //div.style.fontFamily = "'Roboto', sans-serif";
      div.className = 'angular-editor-textarea';
      div.translate = this.config.translate ? true : false;
      div.spellcheck = this.config.spellcheck ? true : false;
      div.style.outline = this.config.outline === false ? 'none': undefined;
      div.innerHTML = content;
      iframe.srcdoc = div.outerHTML;
      iframe.onload = () => {
        //iframe.style['outline'] = '0';
        this.textArea = iframe.contentWindow.document.querySelector('#ngEditor');
        //this.iframe.nativeElement.attribute['scrollbar'] = 'no';
        //this.iframe.nativeElement.style.height = getComputedStyle(this.textArea).height;
        this.doc = this.iframe.nativeElement.contentDocument;
        this.bindEvents();
        this.initDomServices();
        resolve();
      }
      iframe.onerror = (err) => {
        console.log('error loading iframe: ', err);
        reject(err);
      }
    });
  }

  bindEvents() {
    this.textArea.oninput = (event) => {
      this.onContentChanged(event);
    };
    this.textArea.onfocus = (event) => {
      this.textArea.style['outline'] = '0';
      this.onTextAreaFocus(event);
    };
    this.textArea.onblur = (event) => {
      this.onTextAreaBlur(event);
    };
    this.textArea.onclick = (event) => {
      this.onClick(event);
    };
    this.textArea.ondblclick = (event) => {
      this.onDblClick(event);
    };
    this.textArea.onkeyup = (event) => {
      this.onKeyUp(event);
    };
    this.textArea.onmouseleave = (event) => {
      this.onTextAreaMouseOut(event);
    };
    this.textArea.onpaste = (event) => {
      this.onPaste(event);
    };
    this.textArea.onkeydown = (e) => {
      this.editorService.surveyKeyboard(this.textArea);
    };
  }

    /**
   * Write a new value to the element.
   *
   * @param value value to be executed when there is a change in contenteditable
   */
     writeValue(value: any): void {

      if ((!value || value === '<br>' || value === '') !== this.showPlaceholder) {
        this.togglePlaceholder(this.showPlaceholder);
      }
  
      if (value === undefined || value === '' || value === '<br>') {
        value = null;
      }

      if (!this.initialized) {
        this.initIframe(value).then(() => {
          this.editorService.document = this.doc;
        }).finally(() => {
          this.refreshView(value);
          this.initialized = true;
        });
      } else {
        this.refreshView(value);
      }
    }
  
    /**
     * refresh view/HTML of the editor
     *
     * @param value html string from the editor
     */
    refreshView(value: string): void {
      const normalizedValue = value === null ? '' : value;
      this.r.setProperty(this.textArea, 'innerHTML', normalizedValue);
  
      return;
    }

  ngAfterViewInit() {

    this.imageService.imageResized.subscribe((image) => {
      if (image && this.textArea) {
        this.onContentChange(this.textArea);
      }
    });
    this.imageService.imageRemoved.subscribe((value) => {
      if (value && this.textArea) {
        this.onContentChange(this.textArea);
        this.imageRemoved.emit(value);
      }
    });
    // this.tableService.tableSelected.subscribe((position) => {
    //   if (position) {
    //     this.tablePosition = position;
    //   } else {
    //     this.tablePosition = undefined;
    //   }
    // });
    this.tableService.tableRemoved.subscribe((value) => {
      if (value && this.textArea) {
        this.onContentChange(this.textArea);
        this.tablePosition = undefined;
      }
    });
    this.tableService.tableResized.subscribe((table) => {
      if (table && this.textArea) {
        this.onContentChange(this.textArea);
      }
    });
    this.editorService.actionExecuted.subscribe(command => {
      if (command) {
        this.onContentChange(this.textArea);
      }
    });
    if (this.util.isDefined(this.autoFocus)) {
      this.focus();
    }
  }

  init() {
    this.fonts = this.getFonts();
    this.config.fonts = this.getFontOptions();
  }

  initDomServices() {
    setTimeout(() => {
      this.imageService.init(this.textArea, this.doc);
      if (this.config.enableTable) {
        this.tableService.init(this.textArea, this.doc);
      }
    }, 100);

  }

  onPaste(event: ClipboardEvent){
    if (this.config.rawPaste) {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      this.editorService.insertText({
        tagName: 'span',
        textContent: text
      });
      return text;
    }
  }

  /**
   * Executed command from editor header buttons
   * @param command string from triggerCommand
   * @param value
   */
  executeCommand(command: Command) {
    //this.focus();
    if (command.name === 'focus') {
      //this.editorService.currentSelection = this.getSelection(false);
      //this.editorService.saveUserSelection();
      return;
    }
    if (command.name === 'toggleEditorMode') {
      this.toggleEditorMode(this.modeVisual);
    } else if (command.name !== '') {
      this.editorService.currentSelection = this.getSelection(false);
      if (command.name === 'clear') {
        this.editorService.removeSelectedElements(this.getCustomTags());
        this.onContentChange(this.textArea);
      } else {
        this.editorService.execute(command.name, command.value);
      }
      this.exec();
    }
  }

  /**
   * focus event
   */
  onTextAreaFocus(event: FocusEvent): void {
    if (this.focused) {
      event.stopPropagation();
      return;
    }
    this.focused = true;
    this.sendFocusEvent();
    if (!this.touched || !this.changed) {
      this.editorService.executeInNextQueueIteration(() => {
        this.configure();
        this.touched = true;
      });
    }
  }

  private sendFocusEvent() {
    this.editorService.currentSelection = this.getSelection(false);
    if (this.editorService.currentSelection && this.editorService.currentSelection.focusNode) {
      const focused = {
        range: this.editorService.currentSelection.rangeCount > 0 ? this.editorService.currentSelection.getRangeAt(0) : null,
        element: this.editorService.currentSelection.focusNode as HTMLElement
      };
      this.focusEvent.emit(focused);
    }
  }

  /**
   * @description fires when cursor leaves textarea
   */
  public onTextAreaMouseOut(event: MouseEvent): void {
    //this.editorService.saveSelection();
    this.editorService.saveUserSelection();
  }

  /**
   * blur event
   */
  onTextAreaBlur(event: FocusEvent) {
    /**
     * save selection if focussed out
     */
    this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
    if (typeof this.onTouched === 'function') {
      this.onTouched();
    }

    if (event.relatedTarget !== null) {
      const parent = (event.relatedTarget as HTMLElement).parentElement;
      if (!parent.classList.contains('angular-editor-toolbar-set') && !parent.classList.contains('ae-picker')) {
        this.blurEvent.emit(event);
        this.focused = false;
      }
    }
  }

  /**
   *  focus the text area when the editor is focused
   */
  focus() {
    if (this.modeVisual) {
      this.textArea.focus();
    } else {
      const sourceText = this.doc.getElementById('sourceText' + this.id);
      sourceText.focus();
      this.focused = true;
    }
  }

  onContentChanged(event: any) {
    this.onContentChange(event.target);
  }

  /**
   * Executed from the contenteditable section while the input property changes
   * @param element html element from contenteditable
   */
  onContentChange(element: HTMLElement): void {
    if (element) {
      let html = '';
      if (this.modeVisual) {
        html = element.innerHTML;
      } else {
        html = element.innerText;
      }
      if ((!html || html === '<br>')) {
        html = '';
      }
      if (typeof this.onChange === 'function') {
        const value = this.config.sanitize || this.config.sanitize === undefined ? this.safeHtml.transform(html).toString() : html;
        this.onChange(value.trim());
        if ((!html) !== this.showPlaceholder) {
          this.togglePlaceholder(this.showPlaceholder);
        }
      }
      this.changed = true;
    }
  }

  /**
   * Set the function to be called
   * when the control receives a change event.
   *
   * @param fn a function
   */
  registerOnChange(fn: any): void {
    this.onChange = e => (e === '<br>' ? fn('') : fn(e)) ;
  }

  /**
   * Set the function to be called
   * when the control receives a touch event.
   *
   * @param fn a function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * toggles placeholder based on input string
   *
   * @param value A HTML string from the editor
   */
  togglePlaceholder(value: boolean): void {
    if (!value) {
      this.r.addClass(this.editorWrapper.nativeElement, 'show-placeholder');
      this.showPlaceholder = true;

    } else {
      this.r.removeClass(this.editorWrapper.nativeElement, 'show-placeholder');
      this.showPlaceholder = false;
    }
  }

  /**
   * Implements disabled state for this element
   *
   * @param isDisabled Disabled flag
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * toggles editor mode based on bToSource bool
   *
   * @param bToSource A boolean value from the editor
   */
  toggleEditorMode(bToSource: boolean) {
    let oContent: any;
    const editableElement = this.textArea;

    if (bToSource) {
      oContent = this.r.createText(editableElement.innerHTML);
      this.r.setProperty(editableElement, 'innerHTML', '');
      this.r.setProperty(editableElement, 'contentEditable', false);

      const oPre = this.r.createElement('pre');
      this.r.setStyle(oPre, 'margin', '0');
      this.r.setStyle(oPre, 'outline', 'none');

      const oCode = this.r.createElement('code');
      this.r.setProperty(oCode, 'id', 'sourceText' + this.id);
      this.r.setStyle(oCode, 'display', 'block');
      this.r.setStyle(oCode, 'white-space', 'pre-wrap');
      this.r.setStyle(oCode, 'word-break', 'keep-all');
      this.r.setStyle(oCode, 'outline', 'none');
      this.r.setStyle(oCode, 'margin', '0');
      this.r.setStyle(oCode, 'background-color', '#fff5b9');
      this.r.setProperty(oCode, 'contentEditable', true);
      this.r.appendChild(oCode, oContent);
      this.focusInstance = this.r.listen(oCode, 'focus', (event) => this.onTextAreaFocus(event));
      this.blurInstance = this.r.listen(oCode, 'blur', (event) => this.onTextAreaBlur(event));
      this.r.appendChild(oPre, oCode);
      this.r.appendChild(editableElement, oPre);

      this.editorService.setDefaultParagraphSeparator('div');

      this.modeVisual = false;
      this.viewMode.emit(false);
      oCode.focus();
    } else {
      if (this.doc.querySelectorAll) {
        this.r.setProperty(editableElement, 'innerHTML', editableElement.innerText);
      } else {
        oContent = this.doc.createRange();
        oContent.selectNodeContents(editableElement.firstChild);
        this.r.setProperty(editableElement, 'innerHTML', oContent.toString());
      }
      this.r.setProperty(editableElement, 'contentEditable', true);
      this.modeVisual = true;
      this.viewMode.emit(true);
      this.onContentChange(editableElement);
      editableElement.focus();
    }
    this.toolbar.setEditorMode(!this.modeVisual);
  }

  /**
   * toggles editor buttons when cursor moved or positioning
   *
   * Send a node array from the contentEditable of the editor
   */

  getSelection(setFontSize: boolean = true): any {
    let userSelection;
    if (this.doc.getSelection) {
      userSelection = this.doc.getSelection(false);
      var node = userSelection.focusNode as HTMLElement;
      //console.log('getSelection: ', node);
      if (setFontSize && node && node.style && ['0px', ''].includes(node.style.fontSize)) {
        node.style.fontSize = this.config.defaultFontSize ? this.config.defaultFontSize : '14px';
      }
    }
    return userSelection;
  }

  onClick(event: any) {
    setTimeout(()=>{
      this.isSingleClick  = true;
    if (this.isSingleClick) {
      this.sendFocusEvent();
      this.exec();
    }
   }, 100);
  }

  onDblClick(event: any) {
    this.sendFocusEvent();
    this.isSingleClick = false;
  }

  onKeyUp(event: any) {
    this.sendFocusEvent();
    this.exec();
  }

  exec() {
    this.toolbar.triggerButtons();
    const els = [];
    const userSelection = this.getSelection(false);
    if (userSelection) {
      //this.editorService.saveSelection();
      this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
      let a = userSelection.focusNode;
      while (a && a.id !== 'ngEditor') {
        els.unshift(a);
        a = a.parentNode;
      }
    }
    this.toolbar.triggerBlocks(els);
  }

  private configure() {
    this.editorService.uploadUrl = this.config.uploadUrl;
    this.editorService.uploadWithCredentials = this.config.uploadWithCredentials;
    this.editorService.token = this.config.token;
    if (this.config.defaultParagraphSeparator) {
      this.editorService.setDefaultParagraphSeparator(this.config.defaultParagraphSeparator);
    }
    if (this.config.defaultFontName) {
      this.editorService.setFontAttribute('face', this.config.defaultFontName);
    }
    if (this.config.defaultFontSize) {
      this.editorService.setFontAttribute('size', this.config.defaultFontSize);
    }
  }

  getFonts(): SelectOption[] {
    const fonts = this.config.fonts ? this.config.fonts : angularEditorConfig.fonts;
    return fonts.map(x => {
      return {label: x.name, value: x.name};
    });
  }

  getFontOptions(): Font[] {
    return this.config.fonts ? this.config.fonts : angularEditorConfig.fonts;
  }

  getCustomTags() {
    const tags = ['span'];
    this.config.customClasses.forEach(x => {
      if (x.tag !== undefined) {
        if (!tags.includes(x.tag)) {
          tags.push(x.tag);
        }
      }
    });
    return tags.join(',');
  }

  ngOnDestroy() {
    if (this.blurInstance) {
      this.blurInstance();
    }
    if (this.focusInstance) {
      this.focusInstance();
    }
  }

  filterStyles(html: string): string {
    html = html.replace('position: fixed;', '');
    return html;
  }
}
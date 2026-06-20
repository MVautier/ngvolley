import {
  Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional, Renderer2, Self, DoCheck
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, _ErrorStateTracker } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject } from 'rxjs';
import { FileInput } from './file-input.model';

/**
 * Remplace ngx-material-file-input (abandonné, incompatible Angular Material 19
 * qui a supprimé mixinErrorState). Réimplémentation minimale du même contrat
 * (MatFormFieldControl<FileInput>) en s'appuyant sur _ErrorStateTracker, le
 * remplaçant interne de mixinErrorState dans Material 19.
 */
@Component({
  selector: 'ngx-mat-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: FileInputComponent }],
  standalone: false
})
export class FileInputComponent implements MatFormFieldControl<FileInput>, ControlValueAccessor, OnInit, OnDestroy, DoCheck {
  private static nextId = 0;

  private _errorStateTracker: _ErrorStateTracker;

  focused = false;
  controlType = 'file-input';
  autofilled = false;

  private _placeholder: string;
  private _required = false;
  private _multiple: boolean;

  @Input() valuePlaceholder: string;
  @Input() accept: string | null = null;

  @Input()
  get errorStateMatcher(): ErrorStateMatcher {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(matcher: ErrorStateMatcher) {
    this._errorStateTracker.matcher = matcher;
  }

  get errorState(): boolean {
    return this._errorStateTracker.errorState;
  }

  @HostBinding() id = `ngx-mat-file-input-${FileInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy = '';

  stateChanges = new Subject<void>();

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  @Input()
  get value(): FileInput | null {
    return this.empty ? null : new FileInput(this._elementRef.nativeElement.value || []);
  }
  set value(fileInput: FileInput | null) {
    if (fileInput) {
      this.writeValue(fileInput);
      this.stateChanges.next();
    }
  }

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  /** Whether the current input has files */
  get empty() {
    return !this._elementRef.nativeElement.value || this._elementRef.nativeElement.value.length === 0;
  }

  @HostBinding('class.mat-form-field-should-float')
  get shouldLabelFloat() {
    return this.focused || !this.empty || this.valuePlaceholder !== undefined;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(req: boolean | string) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @HostBinding('class.file-input-disabled')
  get isDisabled() {
    return this.disabled;
  }
  @Input()
  get disabled(): boolean {
    return this._elementRef.nativeElement.disabled;
  }
  set disabled(dis: boolean | string) {
    this.setDisabledState(coerceBooleanProperty(dis));
    this.stateChanges.next();
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input' && !this.disabled) {
      this._elementRef.nativeElement.querySelector('input').focus();
      this.focused = true;
      this.open();
    }
  }

  constructor(
    private fm: FocusMonitor,
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
  ) {
    this._errorStateTracker = new _ErrorStateTracker(_defaultErrorStateMatcher, ngControl, _parentFormGroup, _parentForm, this.stateChanges);

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    fm.monitor(_elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  get fileNames() {
    return this.value ? this.value.fileNames : this.valuePlaceholder;
  }

  writeValue(obj: FileInput | null): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', obj instanceof FileInput ? obj.files : null);
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /**
   * Remove all files from the file input component
   * @param [event] optional event that may have triggered the clear action
   */
  clear(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.value = new FileInput([]);
    this._elementRef.nativeElement.querySelector('input').value = null;
    this._onChange(this.value);
  }

  @HostListener('change', ['$event'])
  change(event: Event) {
    const fileList: FileList | null = (event.target as HTMLInputElement).files;
    const fileArray: File[] = [];
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        fileArray.push(fileList[i]);
      }
    }
    this.value = new FileInput(fileArray);
    this._onChange(this.value);
  }

  @HostListener('focusout')
  blur() {
    this.focused = false;
    this._onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  ngOnInit() {
    this.multiple = coerceBooleanProperty(this.multiple);
  }

  open() {
    if (!this.disabled) {
      this._elementRef.nativeElement.querySelector('input').click();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      // Re-evaluate on every change detection cycle: some error triggers
      // (e.g. parent form submission) can't be subscribed to directly.
      this._errorStateTracker.updateErrorState();
    }
  }
}

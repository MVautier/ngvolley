import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Adherent } from '@app/core/models/adherent.model';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Subscription, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-photo-taker',
  templateUrl: './photo-taker.component.html',
  styleUrls: ['./photo-taker.component.scss']
})
export class PhotoTakerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() checked: CheckAdherent;
  @Output() photo: EventEmitter<string> = new EventEmitter<string>();
  files: File[] = [];
  imageChangedEvent: any = '';
  imageBase64: string;

  formGroup: FormGroup;
  licenceNumber: string;
  licenceInputMask: string;

  subModal: Subscription;
  notifier = new Subject<void>();
  display: FormControl = new FormControl('', Validators.required);

  constructor(
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private inscriptionService: InscriptionService) { }


  ngOnInit(): void {
    this.licenceInputMask = this.inscriptionService.licenceInputMask;
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.checked && changes.checked.currentValue) {

    }
  }

  ngOnDestroy(): void {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
  }

  initForm() {
    const patterns = this.inscriptionService.patterns;
    this.formGroup = this.formBuilder.group({
      'licence': [this.licenceNumber, [CustomValidators.licenceCheck(this.checked)]],
    });
  }

  getLicenceError(field: string) {
    return this.inscriptionService.getLicenceError(this.formGroup, field);
  }

  showModal(mode: string) {
    if (this.subModal) {
        this.subModal.unsubscribe();
    }
    this.modalService.open({
      title: mode === 'camera' ? 'Prendre une photo' : 'Recadrer la photo',
      validateLabel: 'Valider',
      cancelLabel: 'Annuler',
      size: {
        width: '640px',
        height: mode === 'cropper' ? '390px' : '665px'
      },
      component: mode,
      data: mode === 'cropper' ? this.imageBase64 : null
    });
    this.subModal = this.modalService.returnData
    .pipe(takeUntil(this.notifier))
    .subscribe(result => {
      console.log('data received from modal: ', result);
      if (result?.data) {
        this.imageBase64 = result.data;
        this.photo.emit(this.imageBase64);
        this.notifier.next();
        this.notifier.complete();
      }
    });
  }

  onSelect(fileList: FileList) {
    console.log(fileList);
    this.getBase64(fileList[0]);
  }

  onReset() {
    this.imageBase64 = null;
    this.files = [];
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  private getBase64(file) {
    var reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result.toString();
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    reader.readAsDataURL(file);
  }
}

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Subscription, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-photo-taker',
  templateUrl: './photo-taker.component.html',
  styleUrls: ['./photo-taker.component.scss']
})
export class PhotoTakerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() checked: CheckAdherent;
  @Input() imageBase64: string;
  @Output() photo: EventEmitter<string> = new EventEmitter<string>();
  files: File[] = [];
  imageChangedEvent: any = '';
  
  subModal: Subscription;
  notifier = new Subject<void>();
  display: FormControl = new FormControl('', Validators.required);

  constructor(
    private modalService: ModalService,
    private inscriptionService: InscriptionService) { }


  ngOnInit(): void {
    
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

  close() {
    this.photo.emit(this.imageBase64);
  }

  onSelect(fileList: FileList) {
    console.log(fileList);
    this.getBase64(fileList[0]).then(result => {
        if (result) {
            this.imageBase64 = result;
            this.photo.emit(this.imageBase64);
        }
    }).catch(err => {
        console.log('Error: ', err);
    });
  }

  onReset() {
    this.imageBase64 = null;
    this.files = [];
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  private getBase64(file): Promise<string> {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.toString());
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
  }
}

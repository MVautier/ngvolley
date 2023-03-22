import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Observable, Subject, Subscription, takeUntil, fromEvent } from 'rxjs';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-adherent-card',
  templateUrl: './adherent-card.component.html',
  styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
  @Input() adherent: Adherent;
  @Output() savePdf: EventEmitter<HTMLElement> = new EventEmitter<HTMLElement>();

  form: FormGroup;
  checked: CheckAdherent = new CheckAdherent();
  healthfile: File;
  subModal: Subscription;
  imgSrc: string;
  notifier = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private inscriptionService: InscriptionService,
    private modalService: ModalService,) { }

  ngOnInit(): void {
    if (this.adherent) {
      this.form = this.fb.group({
        'file' : [undefined, [Validators.required, FileValidator.maxContentSize(this.inscriptionService.filemaxsize)]]
      });
      if (this.adherent.Photo) {
        this.imgSrc = this.adherent.Photo;
      }
      
      this.checked = this.inscriptionService.checkAdherent(this.checked, this.adherent);
      console.log('checked in adherent-card: ', this.checked);
    }
  }

  showModalAuthParent() {
    if (this.subModal) {
        this.subModal.unsubscribe();
    }
    this.modalService.open({
      title: 'Autorisation parentale',
      validateLabel: 'Valider',
      cancelLabel: 'Annuler',
      size: {
        width: '640px',
        height: '1020px'
      },
      component: 'parent-auth',
      data: this.adherent
    });
    this.subModal = this.modalService.returnData
    .pipe(takeUntil(this.notifier))
    .subscribe(result => {
      if (result?.data) {
        this.notifier.next();
        this.notifier.complete();
        this.savePdf.emit(result.data);
      }
    });
  }

  readFile(file: File | Blob): Observable<any> {
    const reader = new FileReader();
    let loadend = fromEvent(reader, 'loadend').pipe(
      map((read: any) => {
        return read.target.result;
      })
    );
    reader.readAsDataURL(file);
    return loadend;
  }

  onFileChange(event) {
    const file = <File>event.file.files[0];
    if (file) {
      console.log('choosen file: ', file);
      this.adherent.HealthFile = file.name;
      console.log('adherent changed: ', this.adherent);
      // this.readFile(file).subscribe(res => {
      //   console.log(res);
      // });
    }
    
  }
}

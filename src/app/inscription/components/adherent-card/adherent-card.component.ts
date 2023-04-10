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
import { AdherentService } from '@app/core/services/adherent.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { PdfInfo } from '@app/core/models/pdf-info.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { PhotoService } from '@app/inscription/services/photo.service';

@Component({
    selector: 'app-adherent-card',
    templateUrl: './adherent-card.component.html',
    styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
    @Input() adherent: Adherent;
    @Output() savePdf: EventEmitter<PdfInfo> = new EventEmitter<PdfInfo>();
    @Output() changed: EventEmitter<Adherent> = new EventEmitter<Adherent>();
    formGroup: FormGroup;
    licenceInputMask: string;
    checked: CheckAdherent = new CheckAdherent();
    healthfile: File;
    subModal: Subscription;
    notifier = new Subject<void>();
    category: string;
    licenceRequired: boolean;
    editPhoto: boolean = true;
    isMobile = false;
    photo_default = 'assets/images/user-default.png';

    constructor(
        private fb: FormBuilder,
        private inscriptionService: InscriptionService,
        private adherentService: AdherentService,
        private photoService: PhotoService,
        private modalService: ModalService) { }

    ngOnInit(): void {
        if (window.matchMedia('(max-width: 1025px)').matches) {
            this.isMobile = true;
        }
        if (this.adherent) {
            this.licenceInputMask = this.inscriptionService.licenceInputMask;
            this.initForm();
            this.formGroup.markAllAsTouched();
            this.adherentService.getCategories().then(result => {
                this.category = result.find(c => c.Code === this.adherent.Category)?.Libelle;
                this.licenceRequired = ['C', 'E'].includes(this.adherent.Category);
            });
            this.formGroup.valueChanges.subscribe(val => {
                this.setFormAdherent();
                this.checkAdherent(this.adherent);
                this.changed.emit(this.adherent);
            });
            this.editPhoto = !this.adherent.Photo;
            this.checked = this.inscriptionService.checkAdherent(this.checked, this.adherent, 3);
            console.log('checked in adherent-card: ', this.checked);
        }
    }

    initForm() {
        this.formGroup = this.fb.group({
            'licence': [this.adherent.Licence, [CustomValidators.licenceCheck(this.checked)]],
            'file': [null, [Validators.required, FileValidator.maxContentSize(this.inscriptionService.filemaxsize)]],
            'rgpd': [this.adherent.Rgpd, [Validators.requiredTrue]]
        });
    }

    checkAdherent(adherent: Adherent) {
        this.checked = this.inscriptionService.checkAdherent(this.checked, adherent, 3);
        console.log('checked: ', this.checked);
    }

    getLicenceError(field: string) {
        if (this.licenceRequired) {
            if (!this.formGroup.get('licence').value) return true;
            return this.inscriptionService.getLicenceError(this.formGroup, field);
        }
        return false;
    }

    getCheckError(field: string): string | boolean {
        return this.inscriptionService.getCheckError(this.formGroup, field);
    }

    showEditPhoto() {
        const div = document.querySelector('#mep');
        if (div && !div.classList.contains('mat-expanded')) {

        }
        this.editPhoto = true;
    }

    showMenuPhoto() {

    }

    showModalPhoto(mode: string) {
        if (this.subModal) {
            this.subModal.unsubscribe();
        }
        this.modalService.open({
            title: mode === 'camera' ? 'Prendre une photo' : 'Recadrer la photo',
            validateLabel: 'Valider',
            cancelLabel: 'Annuler',
            showCancel: true,
            showValidate: true,
            size: {
                width: this.isMobile ? '100%' : '500px',
                height: mode === 'cropper' ? '390px' : (this.isMobile ? '445px' : '620px')
            },
            component: mode,
            data: mode === 'cropper' ? this.adherent.Photo : null
        });
        this.subModal = this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                console.log('data received from modal: ', result);
                if (result?.data) {
                    this.adherent.Photo = result.data;
                    this.changed.emit(this.adherent);
                    //this.photo.emit(this.imageBase64);
                    this.notifier.next();
                    this.notifier.complete();
                }
            });
    }

    onSelectPhoto(fileList: FileList) {
        console.log(fileList);
        this.photoService.getBase64(fileList[0]).then(result => {
            if (result) {
                // this.imageBase64 = result;
                // this.photo.emit(this.imageBase64);
                this.adherent.Photo = result;
                this.changed.emit(this.adherent);
            }
        }).catch(err => {
            console.log('Error: ', err);
        });
    }

    onPhoto(photo: string) {
        this.adherent.Photo = photo;
        this.editPhoto = false;
        this.changed.emit(this.adherent);
    }

    showModalAuthParent() {
        if (this.subModal) {
            this.subModal.unsubscribe();
        }
        this.modalService.open({
            title: 'Autorisation parentale',
            validateLabel: 'Valider',
            cancelLabel: 'Annuler',
            showCancel: true,
            showValidate: true,
            size: {
                width: '800px',
                height: '1040px'
            },
            component: 'parent-auth',
            data: this.adherent
        });
        this.subModal = this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                if (result?.data) {
                    this.adherent.Authorization = result.data.name;
                    if (result.action)
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
        }
    }

    setFormAdherent() {
        this.adherent.Licence = this.formGroup.get('licence').value;
        this.adherent.Rgpd = this.formGroup.get('rgpd').value;
    }
}

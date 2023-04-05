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

    constructor(
        private fb: FormBuilder,
        private inscriptionService: InscriptionService,
        private adherentService: AdherentService,
        private modalService: ModalService) { }

    ngOnInit(): void {
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
        this.editPhoto = true;
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

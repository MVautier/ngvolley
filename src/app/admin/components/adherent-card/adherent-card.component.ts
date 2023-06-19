import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { Adherent } from '@app/core/models/adherent.model';
import { FileService } from '@app/core/services/file.service';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { UtilService } from '@app/core/services/util.service';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Subject, Subscription, first, takeUntil } from 'rxjs';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { AdherentDoc } from '@app/core/models/adherent-doc.model';
import { v4 as uuidv4 } from 'uuid';
import { AdherentService } from '@app/core/services/adherent.service';
import { DatePipe } from '@angular/common';
import { LoaderService } from '@app/ui/layout/services/loader.service';

@Component({
    selector: 'app-adherent-card',
    templateUrl: './adherent-card.component.html',
    styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
    @Input() adherent: Adherent;
    @Output() change: EventEmitter<Adherent> = new EventEmitter<Adherent>();
    @Output() reload: EventEmitter<void> = new EventEmitter<void>();
    @Output() hide: EventEmitter<void> = new EventEmitter<void>();
    photo_default = 'assets/images/user-default.png';
    photo: string;
    subModal: Subscription;
    notifier = new Subject<void>();
    editMode = false;
    config: ModalConfig;
    modalRef: BsModalRef;
    documents: AdherentDoc[] = [
        {type: 'adhesion', libtype: 'Adhésion',filename: null,blob: null,sent: false},
        {type: 'attestation', libtype: 'Attestation de santé',filename: null,blob: null,sent: false},
        {type: 'certificat', libtype: 'Certificat médical',filename: null,blob: null,sent: false},
        {type: 'autorisation', libtype: 'Autorisation parentale',filename: null,blob: null,sent: false},
        {type: 'photo', libtype: 'Photo',filename: null,blob: null,sent: false} 
    ];
    selectedFile: File | null = null;
    selectedType: string;
    hasToSave = false;
    address: string = '-';
    certifDate: string = '-';

    constructor(
        private adherentAdminService: AdherentAdminService,
        private util: UtilService,
        private adherentService: AdherentService,
        private bsModal: BsModalService,
        private datePipe: DatePipe,
        private loader: LoaderService,
        private inscriptionService: InscriptionService,
        private pdf: PdfMakerService,
        private fileService: FileService) { }

    ngOnInit(): void {
        this.init();
    }

    async init() {
        if (this.adherent) {
            if (!this.adherent.Uid) {
                this.adherent.Uid = uuidv4();
                this.hasToSave = true;
            }
            if (!this.adherent.Membres) {
                this.adherent.Membres = [];
            }
            if (this.adherent.Address && this.adherent.PostalCode && this.adherent.City) {
                this.address = this.adherent.Address + ' ' + this.adherent.PostalCode + ' ' + this.adherent.City
            }
            if (this.adherent.CertificateDate) {
                this.certifDate = this.datePipe.transform(this.adherent.CertificateDate, 'dd/MM/yyyy');
            }
            if (this.adherent?.Documents) {
                this.adherent.Documents.forEach(d => {
                    this.setDoc(d);
                    if (d.type === 'photo') {
                        this.adherentAdminService.downloadFile(this.adherent.Uid, d.filename).then(blob => {
                            this.util.blobToDataURL(blob, (result) => {
                                if (result) {
                                    this.photo = result;
                                }
                            });
                        }).catch(err => {
            
                        });
                    }
                });
            }
            if (this.hasToSave) {
                this.loader.setLoading(true);
                await this.adherentService.addOrUpdate(this.adherent);
                this.change.emit(this.adherent);
                this.loader.setLoading(false);
                console.log('adherent was saved with Uid: ', this.adherent);
            }
        }
        
    }

    setDoc(document: AdherentDoc) {
        const doc = this.documents.find(d => d.type === document.type);
        if (doc) {
            doc.filename = document.filename;
            doc.blob = document.blob;
            doc.sent = document.sent;
        }
    }

    download(filename: string) {
        this.adherentAdminService.downloadFile(this.adherent.Uid, filename).then(blob => {
            this.fileService.download(blob, filename);
        }).catch(err => {
            console.error(err);
        });
    }

    handleFileInput(event: any) {
        if (this.selectedType) {
            this.selectedFile = event.target?.files[0];
            console.log('selected file: ', this.selectedFile);
            if (this.selectedFile) {
                this.util.readFile(this.selectedFile).then(blob => {
                    if (blob) {
                        const filename = `${this.selectedType}.pdf`;
                        const id = this.adherent.Uid;
                        const formData = this.fileService.getFormData(id, filename, blob);
                        this.fileService.sendDoc(formData).then(result => {
                            const doc = this.documents.find(d => d.type === this.selectedType);
                            if (doc) {
                                doc.sent = true;
                                doc.filename = filename;
                            }
                            Adherent.addDoc(this.adherent, this.selectedType, filename, blob);
                            console.log('adherent changed: ', this.adherent);
                        });
                    } 
                }); 
            }
        }
        
    }

    navigate(url: string) {
        if (url) {
            window.open(url);
        }
    }

    openEdit() {
        this.config = {
            title: 'Modifier un adhérent',
            validateLabel: 'Enregistrer',
            cancelLabel: 'Annuler',
            showCancel: true,
            showValidate: true,
            size: {
                width: '100%',
                height: '800px'
            },
            component: null,
            data: this.adherent
        };
        this.editMode = true;
        this.adherentAdminService.setAdherent(this.adherent);
        this.modalRef = this.bsModal.show(
            GenericModalComponent,
            Object.assign({}, { class: 'gray modal-xlg' })
        );
        
        this.modalRef.content.config = this.config;
        this.modalRef.content.validate.subscribe((result: Adherent) => {
            console.log('validate adherent form: ', result);
            this.loader.setLoading(true);
            const reload = result.IdAdherent === 0;
            this.adherentService.addOrUpdate(result).then(a => {
                this.adherent = this.util.bindDates(a);
                if (!this.adherent.Documents.find(d => d.type === 'adhesion')) {
                    this.pdf.buildAdherentForm(this.adherent).then(blob => {
                        const filename = `adhesion`;
                        Adherent.addDoc(this.adherent, 'adhesion', filename + '.pdf', blob);
                        console.log('adherent with docs : ', this.adherent);
                        this.pdf.sendDocuments(this.adherent.Uid, this.adherent.Documents).then(() => {
    
                        });
                    }).catch(err => {
                        console.log('error generating adherent form: ', err);
                    }).finally(() => {
                        
                    });
                }
            }).finally(() => {
                this.change.emit(this.adherent);
                if (reload) {
                    this.reload.emit();
                }
                console.log('adherent was saved by modal: ', this.adherent);
                this.loader.setLoading(false);
                this.modalRef.hide();
            });
                
        });

        this.modalRef.content.cancel.pipe(first()).subscribe((result: ModalResult) => {
            // this.returnData.next(result);
            this.modalRef.hide();
            // this.returnData.next(null);
        });
        //this.modalShown.next(config);
    }

    onEditMember() {

    }

    returnToListe() {
        this.hide.emit();
    }

}

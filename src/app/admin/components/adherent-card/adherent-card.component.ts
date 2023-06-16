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

@Component({
    selector: 'app-adherent-card',
    templateUrl: './adherent-card.component.html',
    styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
    @Input() adherent: Adherent;
    @Output() hide: EventEmitter<void> = new EventEmitter<void>();
    photo_default = 'assets/images/user-default.png';
    photo: string;
    subModal: Subscription;
    notifier = new Subject<void>();
    editMode = false;
    config: ModalConfig;
    modalRef: BsModalRef;

    constructor(
        private adherentAdminService: AdherentAdminService,
        private utilService: UtilService,
        private bsModal: BsModalService,
        private modalService: ModalService,
        private inscriptionService: InscriptionService,
        private pdf: PdfMakerService,
        private fileService: FileService) { }

    ngOnInit(): void {
        const photoDoc = this.adherent?.Documents?.find(d => d.type === 'photo');
        if (photoDoc) {
            this.adherentAdminService.downloadFile(this.adherent.Uid, photoDoc.filename).then(blob => {
                this.utilService.blobToDataURL(blob, (result) => {
                    if (result) {
                        this.photo = result;
                    }
                });
            }).catch(err => {

            });
        }
    }

    download(filename: string) {
        this.adherentAdminService.downloadFile(this.adherent.Uid, filename).then(blob => {
            this.fileService.download(blob, filename);
        }).catch(err => {
            console.error(err);
        });
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
        this.modalRef.content.validate.subscribe((result: ModalResult) => {
            // this.returnData.next(result);
            this.modalRef.hide();
            // this.returnData.next(null);
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

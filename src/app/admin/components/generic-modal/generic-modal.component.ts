import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { Adherent } from '@app/core/models/adherent.model';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';

@Component({
    selector: 'app-generic-modal',
    templateUrl: './generic-modal.component.html',
    styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent implements OnInit {
    //@Input() 
    public config: ModalConfig;
    @Input() isDarkTheme = false;

    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
    @Output() validate: EventEmitter<Adherent> = new EventEmitter<Adherent>();
    adherent: Adherent;
    adh: Adherent;
    isValid = false;

    constructor(private adherentAdminService: AdherentAdminService) { 
        this.adherent = this.adherentAdminService.getAdherent();
        this.adh = new Adherent(this.adherent, null, null, this.adherent.Saison);
    }

    ngOnInit(): void {

    }

    onClose() {
        this.cancel.emit();
    }

    onCancel() {
        this.cancel.emit();
    }

    onChange(adherent: Adherent) {
        if (adherent.valid) {
            this.isValid = adherent.valid;
            this.adh = adherent;
        }
    }

    onValidate() {
        console.log('adherent validated: ', this.adh);
        this.validate.emit(this.adh);
    }

}

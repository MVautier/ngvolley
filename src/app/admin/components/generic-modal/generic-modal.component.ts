import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
    constructor(private adherentAdminService: AdherentAdminService) { 
        this.adherent = this.adherentAdminService.getAdherent();
    }

    ngOnInit(): void {

    }

    init() {

    }

    onClose() {
        this.cancel.emit();
    }

    onCancel() {
        this.cancel.emit();
    }

    onValidate() {

    }

}

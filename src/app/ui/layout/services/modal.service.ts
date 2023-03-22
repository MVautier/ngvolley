import { Injectable } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ModalComponent } from "../components/modal/modal.component";
import { ModalConfig } from "../models/modal-config.model";
import { BehaviorSubject, first } from 'rxjs';
import { ModalResult } from "../models/modal-result.model";

@Injectable({ providedIn: 'root' })
export class ModalService {
    modalRef: BsModalRef;
    returnData: BehaviorSubject<ModalResult> = new BehaviorSubject<ModalResult>(null);
    modalShown: BehaviorSubject<ModalConfig> = new BehaviorSubject<ModalConfig>(null);

    constructor(private bsModal: BsModalService) {

    }

    open(config: ModalConfig) {
        this.modalRef = this.bsModal.show(
            ModalComponent,
            Object.assign({}, { class: 'gray modal-xlg' })
        );
        this.modalRef.content.validate.subscribe((result: ModalResult) => {
            this.returnData.next(result);
            this.modalRef.hide();
            this.returnData.next(null);
        });

        this.modalRef.content.cancel.pipe(first()).subscribe((result: ModalResult) => {
            this.returnData.next(result);
            this.modalRef.hide();
            this.returnData.next(null);
        });
        this.modalShown.next(config);
    }

    close() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }
}
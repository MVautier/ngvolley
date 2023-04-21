import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Questionary } from '@app/core/models/questionary.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';

@Component({
    selector: 'app-health-form',
    templateUrl: './health-form.component.html',
    styleUrls: ['./health-form.component.scss']
})
export class HealthFormComponent implements OnInit {
    config: ModalConfig;
    validate: (result: ModalResult) => {};
    cancel: (result: ModalResult) => {};
    data: Questionary;
    groupIndex = 0;
    itemIndex = 0;
    terminated = false;
    nbYes: number = 0;
    city: string;
    now: Date = new Date();
    nom: string;

    constructor(
        private datePipe: DatePipe,
        private pdf: PdfMakerService) { }

    ngOnInit(): void {
        this.data = this.config.data;
    }

    onPrevious() {
        const groups = this.data.questionGroups;
        this.terminated = false;
        if (this.itemIndex > 0) {
            this.itemIndex--;
        } else {
            if (this.groupIndex > 0) {
                this.groupIndex--;
            } else {
                this.groupIndex = 0;
            }
            this.itemIndex = groups[this.groupIndex].items.length - 1;
        }
    }

    onNext() {
        const groups = this.data.questionGroups;
        const group = groups[this.groupIndex];
        if (this.itemIndex < group.items.length - 1) {
            this.itemIndex++;
        } else {
            if (this.groupIndex < groups.length - 1) {
                this.groupIndex++;
                this.itemIndex = 0;
            } else {
                this.terminated = true;
                this.setNbYes();
                console.log('data: ', this.data);
            }
        }
    }

    setNbYes() {
        this.nbYes = 0;
        this.data.questionGroups.forEach(g => {
            g.items.forEach(i => {
                if (i.answer) {
                    this.nbYes++;
                }
            });
        });
    }

    onReset() {
        this.groupIndex = 0;
        this.itemIndex = 0;
        this.terminated = false;
    }

    onDownload() {
        this.pdf.buildHealthForm(this.data);
    }

    onSignature(s: string) {
        this.data.signature = s;
    }

    onCancel() {
        this.cancel({
            action: 'cancel',
            data: null
        });
    }

    checkValid(): boolean {
        if (this.data.mode === 'minor') {
            return this.isValid(this.city) && this.isValid(this.nom) && this.isValid(this.data.signature);
        } else {
            return this.isValid(this.city) && this.isValid(this.data.signature);
        }
    }

    isValid(value: string): boolean {
        return value !== null && value !== undefined && value.length > 2;
    }

    onValidate() {
        this.data.tuteur = this.nom;
        this.data.commune = this.city;
        this.data.date = this.datePipe.transform(this.now, 'dd/MM/yyyy');
        this.pdf.buildHealthForm(this.data, false).then(blob => {
            if (blob) {
                this.validate({
                    action: 'healthform',
                    data: blob
                });
            }
        });
    }

}

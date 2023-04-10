import { Component, OnInit } from '@angular/core';
import { Questionary } from '@app/core/models/questionary.model';
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

    constructor() { }

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
                console.log('data: ', this.data);
            }
        }
    }

    onCancel() {

    }

    onValidate() {

    }

}

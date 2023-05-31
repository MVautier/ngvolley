import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Operator } from '@app/core/models/operator.model';

@Component({
    selector: 'app-adherent-filter',
    templateUrl: './adherent-filter.component.html',
    styleUrls: ['./adherent-filter.component.scss']
})
export class AdherentFilterComponent implements OnInit {

    filter: AdherentFilter;
    @Output() apply: EventEmitter<AdherentFilter> = new EventEmitter<AdherentFilter>();

    showFilter = false;
    hasPhoto = 'tous';
    hasLicence = 'tous';
    Categorie = 'tous';
    Section = 'tous';
    customFields = [
        { columnDef: 'LastName', header: 'Nom' },
        { columnDef: 'FirstName', header: 'Prénom' },
    ];
    selectedCustomField = this.customFields[0];
    operators: Operator[] = [
        { label: 'Est égal à', value: 'Equals' },
        { label: 'Commence par', value: 'StartsWith' },
        { label: 'Finit par', value: 'EndsWith' },
        { label: 'Contient', value: 'Contains' }
    ];

    @ViewChild('input') input: ElementRef;
    constructor() { }

    ngOnInit(): void {
        this.initFilter();
    }

    setDate(event: any, type: string) {
        if (!this.filter.DateRange) {
            this.filter.DateRange = {
                Start: null,
                End: null
            }
        }
        if (type === 'start') {
            this.filter.DateRange.Start = event.value;
        } else {
            this.filter.DateRange.End = event.value;
        }
        console.log('dates changed: ', this.filter.DateRange);
        // if (this.filter.DateRange.Start && this.filter.DateRange.End) {
        //     this.loadData(this.filter);
        // }
    }

    onOptionChange(field: string, event: any) {
        if (field === 'photo') {
            this.filter.HasPhoto = event.value === 'tous' ? null : (event.value === 'avec' ? true : false);
        } else if (field === 'licence') {
            this.filter.HasLicence = event.value === 'tous' ? null : (event.value === 'avec' ? true : false);
        } else if (field === 'category') {
            this.filter.IdCategory = event.value === 'tous' ? null : (event.value === 'C' ? 1 : (event.value === 'L' ? 2 : 3));
        } else if (field === 'section') {
            this.filter.IdSection = event.value === 'tous' ? null : (event.value === '16' ? 1 : (event.value === '18' ? 2 : (event.value === 'A' ? 3 : 4)));
        } else if (field === 'custom') {
            this.filter.DynamicFilter.Field = event.value.columnDef;
        }
        console.log('option changed: ', this.filter);
    }

    initFilter() {
        this.filter = new AdherentFilter(this.selectedCustomField.columnDef);
        this.hasPhoto = 'tous';
        this.hasLicence = 'tous';
        this.Categorie = 'tous';
        this.Section = 'tous';
        this.selectedCustomField = this.customFields[0];
    }

    onShowFilter() {
        this.showFilter = true;
    }

    onHideFilter() {
        this.showFilter = false;
    }

    resetFilter() {
        this.initFilter();
        this.apply.emit(this.filter);
        this.showFilter = false;
    }

    setFilter() {
        this.filter.DynamicFilter.Value = this.input.nativeElement.value;
        this.apply.emit(this.filter);
        this.showFilter = false;
    }

}
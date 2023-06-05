import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Adherent } from '@app/core/models/adherent.model';
import { StartInscription } from '@app/inscription/models/start-inscription.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { environment } from '@env/environment';

@Component({
    selector: 'app-start-form',
    templateUrl: './start-form.component.html',
    styleUrls: ['./start-form.component.scss'],
})
export class StartFormComponent implements OnInit {
    @Input() start: StartInscription;
    @Output() validate: EventEmitter<StartInscription> =
        new EventEmitter<StartInscription>();
    nom: string;
    prenom: string;
    nomado: string;
    prenomado: string;
    birthday: Date;
    section: string;
    alreadySigned = false;
    formGroup: FormGroup;
    sections: string[] = [];
    sectionsWithoutVolley: string[] = [];
    city: string = environment.city;
    asso = environment.asso;
    year: string;
    public isMobile = false;
    reinscription: boolean = environment.reinscription;
    showForm = false;
    adofound: Adherent = undefined;

    constructor(
        private inscriptionService: InscriptionService,
        private formBuilder: FormBuilder,
        private _adapter: DateAdapter<any>,
        @Inject(MAT_DATE_LOCALE) private _locale: string
    ) {
        if (window.matchMedia('(max-width: 1025px)').matches) {
            this.isMobile = true;
        }
    }

    ngOnInit(): void {
        if (this.start) {
            this._locale = 'fr';
            this._adapter.setLocale(this._locale);
            if (this.reinscription && environment.debug) {
                this.nomado = 'chene';
                this.prenomado = 'paul';
                this.birthday = new Date(2006, 0, 14);
            }
            this.showForm = !this.reinscription;
            const y = new Date().getFullYear();
            this.year = y.toString() + '-' + (y + 1).toString();
            this.alreadySigned = this.start.nom !== null && this.start.prenom !== null && this.start.section !== null;
            this.sections = this.inscriptionService.sections;
            this.sectionsWithoutVolley = this.inscriptionService.sections.filter(s => s !== 'Volley-ball');
            this.formGroup = this.formBuilder.group({
                local: [this.start.local, [Validators.required]],
                nom: [this.start.nom, [Validators.required]],
                prenom: [this.start.prenom, [Validators.required]],
                section: [this.start.section, [Validators.required]],
            });
        }
    }

    getInputError(field: string) {
        return this.inscriptionService.getInputError(this.formGroup, field);
    }


    getDateError(field: string): string | boolean {
        return this.inscriptionService.getDateError(this.formGroup, field);
    }

    onCancel() {
        this.alreadySigned = false;
    }

    onValidate() {
        const info = this.getFormValue();
        this.validate.emit(info);
    }

    onValidateAdo() {
        if (this.nomado && this.prenomado && this.birthday) {
            this.adofound = this.inscriptionService.findAdo(this.nomado, this.prenomado, this.birthday);
            if (this.adofound) {
                this.showForm = true;
            } else {
                this.showForm = false;
            }
        } else {
            this.adofound = undefined;
            this.showForm = false;
        }
    }

    getFormValue(): StartInscription {
        return {
            local: this.start.local,
            already: this.start.already,
            nom: this.alreadySigned ? this.formGroup.get('nom').value : null,
            prenom: this.alreadySigned ? this.formGroup.get('prenom').value : null,
            section: this.start.already || this.alreadySigned ? this.formGroup.get('section').value : null,
            found: this.adofound
        };
    }
}

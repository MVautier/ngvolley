import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Adherent } from '@app/core/models/adherent.model';
import { Category } from '@app/core/models/category.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { UtilService } from '@app/core/services/util.service';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-adherent-form',
    templateUrl: './adherent-form.component.html',
    styleUrls: ['./adherent-form.component.scss']
})
export class AdherentFormComponent implements OnInit, OnDestroy {
    @Input() adherent: Adherent;
    @Input() members: Adherent[] = [];
    @Input() local: boolean;
    @Input() isMobile: boolean;
    @Output() change: EventEmitter<Adherent> = new EventEmitter<Adherent>();
    @Output() validateForm: EventEmitter<Adherent> = new EventEmitter<Adherent>();
    @Output() cancelForm: EventEmitter<void> = new EventEmitter<void>();
    @Output() removeMember: EventEmitter<string> = new EventEmitter<string>();

    formGroup: FormGroup;
    phoneInputMask: string;
    cpInputMask: string;
    choosenSection = false;
    noLicenceRequired = false;
    checked: CheckAdherent;
    categories: Category[] = [];
    subAddAdherent: Subscription;
    titles: string[] = [];
    notifier = new Subject<void>();
    subModal: Subscription;
    all_sections: string[] = [];


    constructor(private inscriptionService: InscriptionService,
        private adherentService: AdherentService,
        private _adapter: DateAdapter<any>,
        private modalService: ModalService,
        private util: UtilService,
        private pdf: PdfMakerService,
        @Inject(MAT_DATE_LOCALE) private _locale: string,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.all_sections = this.inscriptionService.sections;
        this.phoneInputMask = this.inscriptionService.phoneInputMask;
        this.cpInputMask = this.inscriptionService.cpInputMask;
        if (this.adherent) {
            this.titles.push(this.adherent.FirstName || this.adherent.LastName ? this.adherent.FirstName + ' ' + this.adherent.LastName : 'Adhérent');
            this.checkAdherent(this.adherent);
            this.members = [].concat(this.adherent.Membres);
            this.choosenSection = this.adherent.Category !== null;
            this.noLicenceRequired = this.choosenSection && this.adherent.Category === 'L';
            this.subAddAdherent = this.inscriptionService.obsAddMember.subscribe(member => {
                if (member) {
                    this.onAddMember(member);
                }
            });
            this.adherentService.getCategories().then(liste => {
                //this.categories = liste.filter(c => !c.Blocked);
                this.categories = liste;
                this.initForm();
                this.formGroup.markAllAsTouched();
                //this.change.emit(this.formGroup);
                console.log('categories: ', this.categories);
                this.formGroup.valueChanges.subscribe(val => {
                    const adh = this.getFormAdherent();
                    this.adherent.Sections = adh.Sections;
                    this.choosenSection = adh.Category !== null;
                    this.noLicenceRequired = this.choosenSection && adh.Category === 'L';
                    this.checkAdherent(adh);
                    this.inscriptionService.checkControl(this.formGroup, 'birthdate');
                    this.titles[0] = adh.FirstName || adh.LastName ? adh.FirstName + ' ' + adh.LastName : 'Adhérent';
                    this.change.emit(adh);
                });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subAddAdherent) {
            this.subAddAdherent.unsubscribe();
        }
    }

    initForm() {
        this._locale = 'fr';
        this._adapter.setLocale(this._locale);
        const patterns = this.inscriptionService.patterns;
        this.formGroup = this.formBuilder.group({
            'id': [this.adherent.IdAdherent],
            'saison': [this.adherent.Saison, [Validators.required, Validators.pattern(patterns.saison.pattern)]],
            'lastname': [this.adherent.LastName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
            'firstname': [this.adherent.FirstName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
            'genre': [this.adherent.Genre, [Validators.required]],
            'birthdate': [this.adherent.BirthdayDate, [Validators.required, CustomValidators.dateCheck(this.checked)]],
            'address': [this.adherent.Address],
            'postalcode': [this.adherent.PostalCode],
            'city': [this.adherent.City],
            'phone': [this.adherent.Phone, [Validators.required, Validators.pattern(patterns.telfixe.pattern)]],
            'email': [this.adherent.Email, [Validators.required, Validators.pattern(patterns.email.pattern)]],
            'alert1': [this.adherent.Alert1, [Validators.minLength(10), Validators.maxLength(500), Validators.pattern(patterns.alert.pattern)]],
            'alert2': [this.adherent.Alert2, [Validators.minLength(0), Validators.maxLength(500), Validators.pattern(patterns.alert.pattern)]],
            'alert3': [this.adherent.Alert3, [Validators.minLength(0), Validators.maxLength(500), Validators.pattern(patterns.alert.pattern)]],
            'category': [this.adherent.Category, [Validators.required]],
            'sections': [this.adherent.Sections],
            'rgpd': [this.adherent.Rgpd],
            'team1': [this.adherent.Team1],
            'team2': [this.adherent.Team2],
            'certifdate': [this.adherent.CertificateDate],
            'paycomment': [this.adherent.PaymentComment],
            'licence': [this.adherent.Licence]
        });
    }

    checkAdherent(adherent: Adherent) {
        this.checked = this.inscriptionService.checkAdherent(this.checked, adherent, 2);
        console.log('checked: ', this.checked);
    }

    getInputError(field: string) {
        return this.inscriptionService.getInputError(this.formGroup, field);
    }

    getCpError(field: string) {
        return this.inscriptionService.getCpError(this.formGroup, field, this.local);
    }

    getDateError(field: string): string | boolean {
        return this.inscriptionService.getDateError(this.formGroup, field);
    }

    getFileError(field: string): string | boolean {
        return this.inscriptionService.getFileError(this.formGroup, field);
    }

    getPatternError(field: string): string | boolean {
        return this.inscriptionService.getPatternError(this.formGroup, field);
    }

    onAddMember(member: Adherent) {
        this.resetOpened();
        this.members = [].concat(this.adherent.Membres);
        this.titles.push(member.FirstName || member.LastName ? member.FirstName + ' '  + member.LastName : 'Membre ' + this.members.length);
    }

    showPopupRemove(member: Adherent = null) {
        if (this.subModal) {
            this.subModal.unsubscribe();
        }
        this.modalService.open({
            title: 'Suppression d\'un membre',
            validateLabel: 'Valider',
            cancelLabel: 'Annuler',
            showCancel: true,
            showValidate: true,
            size: {
                width: '100%',
                height: '240px'
            },
            component: 'popup-remove',
            data: member
        });
        this.subModal = this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                if (result && this.modalService.modalShown.value.component === 'popup-remove') {
                    if (result.data) {
                        this.onRemoveMember(member);
                    }
                    this.notifier.next();
                    this.notifier.complete();
                }
            });
    }

    onRemoveMember(member: Adherent = null) {
        if (member) {
            const index = this.adherent.Membres.findIndex(m => m.Uid === member.Uid);
            if (index >= 0) {
                this.adherent.Membres.splice(index, 1);
                this.titles.splice(index + 1, 1);
                this.members = [].concat(this.adherent.Membres);
                const current = this.members.length ? this.members[this.members.length - 1] : this.adherent;
                this.resetOpened(current.Uid);
                this.removeMember.emit(member.Uid);
            }
        } 
    }

    resetOpened(uid: string = null) {
        this.adherent._opened = uid && this.adherent.Uid === uid;
        this.adherent.Membres.forEach(m => {
            m._opened = uid && m.Uid === uid;
        });
    }

    onCancel() {
        this.cancelForm.emit();
    }

    isFormValid(): boolean {
        let valid = !this.formGroup.invalid && this.checked.valid;
        if (valid) {
            for (let i = 0; i < this.adherent.Membres.length; i++) {
                if (!this.adherent.Membres[i].valid) {
                    valid = false;
                    break;
                }
            }
        }
        return valid;
    }

    getFormAdherent(): Adherent {
        const category = this.formGroup.get('category').value;
        const birthdate = this.util.UtcDate(this.formGroup.get('birthdate').value);
        const certifdate = this.util.UtcDate(this.formGroup.get('certifdate').value);
        const age = Adherent.getAge(birthdate);
        const section = age <= 16 ? 'U16' : (age <= 18 ? 'U18' : 'Adulte');
        return {
            IdAdherent: this.formGroup.get('id').value,
            Category: category,
            Section: section,
            FirstName: this.formGroup.get('firstname').value,
            LastName: this.formGroup.get('lastname').value,
            Genre: this.formGroup.get('genre').value,
            BirthdayDate: birthdate,
            Address: this.formGroup.get('address').value || '',
            PostalCode: this.formGroup.get('postalcode').value || '',
            City: this.formGroup.get('city').value || '',
            Phone: this.formGroup.get('phone').value,
            Email: this.formGroup.get('email').value,
            Age: age,
            Membres: this.adherent.Membres,
            Relationship: null,
            Alert1: this.formGroup.get('alert1').value,
            Alert2: this.formGroup.get('alert2').value,
            Alert3: this.formGroup.get('alert3').value,
            Sections: this.formGroup.get('sections').value,
            valid: !this.formGroup.invalid,
            Uid: this.adherent.Uid,
            Licence: this.formGroup.get('licence').value,
            HealthFile: this.adherent.HealthFile,
            Photo: this.adherent.Photo,
            Authorization: this.adherent.Authorization,
            Rgpd: this.formGroup.get('rgpd').value,
            ImageRight: this.adherent.ImageRight,
            Signature: this.adherent.Signature,
            TrainingTE: category !== null && category === 'L' ? this.adherent.TrainingTE : null,
            TrainingFM: category !== null && category === 'L' ? this.adherent.TrainingFM : null,
            TrainingFE: category !== null && category === 'L' ? this.adherent.TrainingFE : null,
            Documents: this.adherent.Documents,
            Saison: this.formGroup.get('saison').value,
            Order: null,
            Team1: this.formGroup.get('team1').value,
            Team2: this.formGroup.get('team2').value,
            CertificateDate: certifdate,
            PaymentComment: this.formGroup.get('paycomment').value,
            InscriptionDate: this.adherent.InscriptionDate
        };
    }
}

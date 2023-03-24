import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Adherent } from '@app/core/models/adherent.model';
import { Category } from '@app/core/models/category.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { FileValidator } from 'ngx-material-file-input';
import { environment } from '@env/environment';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { Subscription } from 'rxjs';
import { ModalService } from '@app/ui/layout/services/modal.service';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit {
  @Input() adherent: Adherent;
  @Output() change: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  @Output() remove: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  formGroup: FormGroup;
  phoneInputMask: string;
  all_sections: string[] = [];
  categories: Category[] = [];
  choosenSection = false;
  noLicenceRequired = false;
  checked: CheckAdherent = new CheckAdherent();
  subModal: Subscription;

  constructor(
    private inscriptionService: InscriptionService,
    private modalService: ModalService,
    private adherentService: AdherentService,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private formBuilder: FormBuilder
  ) { }


  ngOnInit(): void {
    this.all_sections = this.inscriptionService.sections;
    this.phoneInputMask = this.inscriptionService.phoneInputMask;
    this.adherentService.getCategories().then(liste => {
      this.categories = liste;
      this.initForm();
      this.checkAdherent(this.adherent);
      this.formGroup.valueChanges.subscribe(val => {
        const adh = this.getFormAdherent(val);
        this.choosenSection = adh.Category !== null;
        this.noLicenceRequired = this.choosenSection && adh.Category === 'L';
        this.checkAdherent(adh);
        this.inscriptionService.checkControl(this.formGroup, 'birthdate');
        this.change.emit(adh);
      });
    });
  }

  initForm() {
    this._locale = 'fr';
    this._adapter.setLocale(this._locale);
    const patterns = this.inscriptionService.patterns;
    const minYear = new Date().getFullYear() - environment.minage;
    this.formGroup = this.formBuilder.group({
      'id': [this.adherent.IdAdherent],
      'lastname': [this.adherent.LastName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'firstname': [this.adherent.FirstName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'genre': [this.adherent.Genre, [Validators.required]],
      'birthdate': [this.adherent.BirthdayDate, [Validators.required, CustomValidators.dateCheck(this.checked)]],
      'phone': [this.adherent.Phone, [Validators.required, Validators.pattern(patterns.telfixe.pattern)]],
      'email': [this.adherent.Email, [Validators.required, Validators.pattern(patterns.email.pattern)]],
      'relationship': [this.adherent.Relationship, [Validators.required]],
      'sections': [this.adherent.Sections, [Validators.required]],
      'category': [this.adherent.Category, [Validators.required]],
      'rgpd': [this.adherent.Rgpd, [Validators.requiredTrue]]
    });
  }

  checkAdherent(adherent: Adherent) {
    this.checked = this.inscriptionService.checkAdherent(this.checked, adherent);
  }

  getInputError(field: string) {
    return this.inscriptionService.getInputError(this.formGroup, field);
  }

  getCpError(field: string) {
    return this.inscriptionService.getCpError(this.formGroup, field);
  }

  getDateError(field: string): string | boolean {
    return this.inscriptionService.getDateError(this.formGroup, field);
  }

  getFileError(field: string): string | boolean {
    return this.inscriptionService.getFileError(this.formGroup, field);
  }

  getCheckError(field: string): string | boolean {
    return this.inscriptionService.getCheckError(this.formGroup, field);
  }

  onRemoveMember() {
    this.remove.emit(this.adherent);
  }

  getFormAdherent(value: any): Adherent {
    const category = this.formGroup.get('category').value;
    return {
      IdAdherent: value.id,
      Category: category, //this.categories.find(c => c.Code === this.formGroup.get('category').value)?.Code,
      FirstName: value.firstname,
      LastName: value.lastname,
      Genre: value.genre,
      BirthdayDate: value.birthdate,
      Address: this.adherent.Address,
      PostalCode: this.adherent.PostalCode,
      City: this.adherent.City,
      Phone: value.phone,
      Email: value.email,
      Age: Adherent.getAge(value.birthdate),
      Membres: [],
      Relationship: value.relationship,
      AlertLastName: this.adherent.AlertLastName,
      AlertFirstName: this.adherent.AlertFirstName,
      AlertPhone: this.adherent.AlertPhone,
      Sections: value.sections,
      valid: !this.formGroup.invalid && this.checked.valid,
      Uid: this.adherent.Uid,
      Rgpd: this.formGroup.get('rgpd').value,
      ImageRight: this.adherent.ImageRight,
      TrainingTE: category !== null && category === 'L' ? this.adherent.TrainingTE : null,
      TrainingFM: category !== null && category === 'L' ? this.adherent.TrainingFM : null,
      TrainingFE: category !== null && category === 'L' ? this.adherent.TrainingFE : null
    };
  }
}

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
import { MemberRemove } from '@app/inscription/models/member-remove.model';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {
  @Input() adherent: Adherent;
  @Input() members: Adherent[] = [];
  @Input() local: boolean;
  @Output() change: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  @Output() validate: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() addMember: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  @Output() removeMember: EventEmitter<MemberRemove> = new EventEmitter<MemberRemove>();
  mode: string;
  formGroup: FormGroup;
  phoneInputMask: string;
  cpInputMask: string;
  choosenSection = false;
  licenceRequired = false;
  noLicenceRequired = false;
  checked: CheckAdherent = new CheckAdherent();
  categories: Category[] = [];
  

  constructor(
    private inscriptionService: InscriptionService,
    private adherentService: AdherentService,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.phoneInputMask = this.inscriptionService.phoneInputMask;
    this.cpInputMask = this.inscriptionService.cpInputMask;
    if (this.adherent) {
      this.inscriptionService.obsAddMember.subscribe(add => {
        if (add) {
          this.onAddMember();
        }
      });
      this.adherentService.getCategories().then(liste => {
        this.categories = liste;
        this.initForm();
        console.log('categories: ', this.categories);
        this.formGroup.valueChanges.subscribe(val => {
          const adh = this.getFormAdherent();
          this.choosenSection = adh.Category !== null;
          this.licenceRequired = this.choosenSection && ['C', 'E'].includes(adh.Category);
          this.noLicenceRequired = this.choosenSection && adh.Category === 'L';
          this.checkAdherent(adh);
          this.checkControl('birthdate');
          this.change.emit(adh);
        });
      });
    }
  }

  checkControl(name: string) {
    const control = this.formGroup.get(name);
    //if (!control.hasError) {
        control.updateValueAndValidity({ onlySelf: true});
        if (control.hasError) {
            control.markAsTouched();
        }
    //}
  }

  initForm() {
    this._locale = 'fr';
    this._adapter.setLocale(this._locale);
    const patterns = this.inscriptionService.patterns;
    this.formGroup = this.formBuilder.group({
      'id': [this.adherent.IdAdherent],
      'lastname': [this.adherent.LastName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'firstname': [this.adherent.FirstName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'genre': [this.adherent.Genre, [Validators.required]],
      'birthdate': [this.adherent.BirthdayDate, [Validators.required, CustomValidators.dateCheck(this.checked)]],
      'address': [this.adherent.Address, [this.mode === 'adherent' ? Validators.required : Validators.nullValidator]],
      'postalcode': [this.adherent.PostalCode, [this.mode === 'adherent' ? Validators.required : Validators.nullValidator, Validators.pattern(this.local ? patterns.localpostalcode.pattern : patterns.postalcode.pattern)]],
      'city': [this.adherent.City, [this.mode === 'adherent' ? Validators.required : Validators.nullValidator, Validators.pattern(patterns.onlystring.pattern)]],
      'phone': [this.adherent.Phone, [Validators.required, Validators.pattern(patterns.telfixe.pattern)]],
      'email': [this.adherent.Email, [Validators.required, Validators.pattern(patterns.email.pattern)]],
      'alertlastname': [this.adherent.AlertLastName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'alertfirstname': [this.adherent.AlertLastName, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(patterns.onlystring.pattern)]],
      'alertphone': [this.adherent.AlertLastName, [Validators.pattern(patterns.telfixe.pattern)]],
      'category': [this.adherent.Category, [Validators.required]],
      //'healthfile': [null, [Validators.required, FileValidator.maxContentSize(this.inscriptionService.filemaxsize)]],
      'rgpd': [this.adherent.Rgpd, [Validators.requiredTrue]]
    });
  }

  checkAdherent(adherent: Adherent) {
    this.checked = this.inscriptionService.checkAdherent(this.checked, adherent);
    console.log('checked: ', this.checked);
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

  onAddMember() {
    const member = new Adherent(this.adherent.PostalCode);
    member.Sections = this.inscriptionService.sections.filter(s => s === environment.section);
    this.adherent.Membres.push(member);
    this.members = [].concat(this.adherent.Membres);
    this.addMember.emit(this.adherent);
  }

  onRemoveMember(member: Adherent = null) {
    let user = '';
    if (member) {
      user = member.Uid;
      const index = this.adherent.Membres.findIndex(m => m.Uid === member.Uid);
      if (index >= 0) {
        this.adherent.Membres.splice(index, 1);
      }
    } else {
      user = this.adherent.Membres[this.adherent.Membres.length - 1].Uid;
      this.adherent.Membres.pop();
    }
    this.members = [].concat(this.adherent.Membres);
    this.removeMember.emit({
      adherent: this.adherent,
      user: user
    });
  }

  onMemberChange(member: Adherent) {
    const index = this.adherent.Membres.findIndex(m => m.Uid === member.Uid);
    if (index >= 0) {
      this.adherent.Membres[index] = member;
      this.change.emit(this.getFormAdherent());
    }
  }

  onPhoto(photo: string) {
    this.adherent.Photo = photo;
  }

  onCancel() {
    this.cancel.emit();
  }

  onValidate() {
    const adherent = this.getFormAdherent();
    this.validate.emit(adherent);
  }

  isFormValid(): boolean {
    let valid = !this.formGroup.invalid && this.checked.valid;
    if (valid) {
      for(let i = 0; i < this.adherent.Membres.length; i++) {
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
    return {
      IdAdherent: this.formGroup.get('id').value,
      Category: category, //this.categories.find(c => c.Code === this.formGroup.get('category').value)?.Code,
      FirstName: this.formGroup.get('firstname').value,
      LastName: this.formGroup.get('lastname').value,
      Genre: this.formGroup.get('genre').value,
      BirthdayDate: this.formGroup.get('birthdate').value,
      Address: this.formGroup.get('address').value,
      PostalCode: this.formGroup.get('postalcode').value,
      City: this.formGroup.get('city').value,
      Phone: this.formGroup.get('phone').value,
      Email: this.formGroup.get('email').value,
      Age: Adherent.getAge(this.formGroup.get('birthdate').value),
      Membres: this.adherent.Membres,
      Relationship: null,
      AlertLastName: this.formGroup.get('alertlastname').value,
      AlertFirstName: this.formGroup.get('firstname').value,
      AlertPhone: this.formGroup.get('alertphone').value,
      Sections: this.inscriptionService.sections.filter(s => s === environment.section),
      valid: !this.formGroup.invalid,
      Uid: this.adherent.Uid,
      //HealthFile: this.formGroup.get('healthfile').value,
      Photo: this.adherent.Photo,
      Rgpd: this.formGroup.get('rgpd').value,
      ImageRight: this.adherent.ImageRight,
      TrainingTE: category !== null && category === 'L' ? this.adherent.TrainingTE : null,
      TrainingFM: category !== null && category === 'L' ? this.adherent.TrainingFM : null,
      TrainingFE: category !== null && category === 'L' ? this.adherent.TrainingFE : null
    };
  }
}

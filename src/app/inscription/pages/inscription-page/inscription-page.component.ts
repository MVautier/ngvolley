import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Adherent } from '@app/core/models/adherent.model';
import { RegexShared } from '@app/core/services/regex-shared';

@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription-page.component.html',
  styleUrls: ['./inscription-page.component.scss']
})
export class InscriptionPageComponent implements OnInit {
  adherent: Adherent = new Adherent();
  formGroup: FormGroup;
  requiredAlert: string = 'Ce champ est requis';
  phoneInputMask = '00 00 00 00 00';
  // telfixePattern: RegExp = /^0(1|2|3|4|5|9)() [0-9]{2}){4}/;
  // mobilePattern: RegExp = /^0(6|7)( [0-9]{2}){4}/;
  patterns = { 
    'postalcode': { pattern: /[0-9]{5}/ },
    'onlystring': { pattern: /[a-zA-Z- '"]/ },
    'telfixe': { pattern: /^0(1|2|3|4|5|9)([0-9]{2}){4}/ },
    'mobile': { pattern: /^0(6|7)([0-9]{2}){4}/ },
    'email': { pattern: /^(?:[A-z0-9!#$%&'*\/=?^_{|}~]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")[\.\_\-\+]?(?:[A-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[A-z0-9](?:[A-z0-9-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[A-z0-9-]*[A-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/ } 
  };

  constructor(
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private formBuilder: FormBuilder,
    private regex: RegexShared) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this._locale = 'fr';
    this._adapter.setLocale(this._locale);
    this.formGroup = this.formBuilder.group({
      'lastname': [this.adherent.lastname, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(this.patterns.onlystring.pattern)]],
      'firstname': [this.adherent.firstname, [Validators.required, Validators.minLength(0), Validators.maxLength(100), Validators.pattern(this.patterns.onlystring.pattern)]],
      'sex': [this.adherent.sex, [Validators.required]],
      'birthdate': [this.adherent.birthdate, [Validators.required]],
      'address': [this.adherent.address, [Validators.required]],
      'postalcode': [this.adherent.postalcode, [Validators.required, Validators.pattern(this.patterns.postalcode.pattern)]],
      'city': [this.adherent.city, [Validators.required, Validators.pattern(this.patterns.onlystring.pattern)]],
      'phone': [this.adherent.phone, [Validators.required, Validators.pattern(this.patterns.telfixe.pattern)]],
      'mobile': [this.adherent.mobile, [Validators.required, Validators.pattern(this.patterns.mobile.pattern)]],
      'email': [this.adherent.email, [Validators.required, Validators.pattern(this.patterns.email.pattern)]]
    });
  }

  getInputError(field: string) {
    return this.formGroup.get(field).hasError('required') ? this.requiredAlert :
        this.formGroup.get(field).hasError('pattern') ? 'Le format est invalide' : '';
  }

  getDateError(field: string): string | boolean {
    return this.formGroup.get(field).hasError('required') ? this.requiredAlert : '';
  }

  addInfo(type: string, event: MatDatepickerInputEvent<Date>) {
    // const d = event.value;
    // if (d) {

    // }
    // console.log(`${type}: ${event.value}`);
  }

  onSubmit() {
    console.log('adherent: ', this.adherent);
  }
}

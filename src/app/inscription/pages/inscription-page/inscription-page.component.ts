import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RegexShared } from '@app/core/services/regex-shared';

@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription-page.component.html',
  styleUrls: ['./inscription-page.component.scss']
})
export class InscriptionPageComponent implements OnInit {

  formGroup: FormGroup;
  requiredAlert: string = 'Ce champ est requis';

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
      'lastname': ['', [Validators.required, Validators.minLength(0), Validators.maxLength(100)]],
      'firstname': ['', [Validators.required, Validators.minLength(0), Validators.maxLength(100)]],
      'genre': ['M', [Validators.required]],
      'birthdate': ['', [Validators.required]],
      'address': ['', [Validators.required]],
      'postalcode': ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      'city': ['', [Validators.required]],
      'phone': ['', [Validators.required, Validators.pattern(this.regex.regexPhone)]],
      'mobile': ['', [Validators.required, Validators.pattern(this.regex.regexMobile)]],
      'email': ['', [Validators.required, Validators.pattern(this.regex.regexEmail)]]
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
}

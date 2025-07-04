import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { environment } from "@env/environment";
import { CheckAdherent } from "../models/check-adherent.model";

export class CustomValidators {
  static dateCheck(checked: CheckAdherent): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null) {
        return null;
      }
      const valideDate = new Date(new Date().getFullYear() - environment.minage, 11, 31);
      const valideDateAdulte = new Date(new Date().getFullYear() - 18, 8, 1);
      const minDate = valideDate >= new Date(control.value);
      return minDate && checked.birthdayDateValid ? null : (!minDate ? {
        'date-minimum': {
          'date-minimum': valideDate,
          'actual': control.value
        }
      } : {
        'date-section': {
          'date-minimum': valideDate,
          'actual': control.value
        }
      });
    };
  }

  static checkAdult(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null) {
        return null;
      }
      const valideDateAdulte = new Date(new Date().getFullYear() - 18, 8, 1);
      const valid = valideDateAdulte >= new Date(control.value);
      return valid ? null : {
        'date-adulte': {
          'date-minimum': valideDateAdulte,
          'actual': control.value
        }
      };
    };
  }

  static licenceCheck(checked: CheckAdherent): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null) {
        return null;
      }
      const check = checked && checked.found && checked.found.Licence ? checked.found.Licence === control.value : true;
      const match = new RegExp(/[0-9]{6,}/, 'g').test(control.value);
      return check && match ? null : (!check ? {
        'licence': {
          'correct': checked.found.Licence,
          'actual': control.value
        }
      } : {
        'format': {
          'date-minimum': '000000',
          'actual': control.value
        }
      });
    };
  }

  static nullOrPatternCheck(regex: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null || control.value === '') {
        return null;
      }

      const match = new RegExp(regex, 'g').test(control.value);
      return match ? null : {
        'pattern': {
          'valid format': regex.source,
          'actual': control.value
        }
      };
    };
  }

  static checkName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null || control.value === '') {
        return null;
      }

      let value = control.value;
      // min : 2 et max : 100
      let valid = value.length > 1 && value.length <= 100;
      let match: boolean;
      if (valid) {
        // valeurs interdites
        const forbidden: string[] = ['firstname', 'lastname', 'unknown', 'first_name', 'last_name', 'anonyme', 'user', 'admin', 'name', 'nom', 'prénom', 'test'];
        valid = !forbidden.includes(value);
      }
      if (valid) {
        // les chiffres sont interdits
        valid = !new RegExp('[0-9]{1,}', 'g').test(value);
      }
      if (valid) {
        // test si 3 caractères répétitifs
        valid = !new RegExp('([\\da-z_-])\\1{2,}', 'i').test(value);
      }
      if (valid) {
        // au moins une voyelle
        valid = new RegExp('([aeiouy]){1,}', 'i').test(value);
      }

      return valid ? null : {
        'pattern': {
          'valid format': '',
          'actual': control.value
        }
      };
    };
  }
}
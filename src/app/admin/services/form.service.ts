import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { WebItem } from '@app/core/models/web-item.model';


@Injectable()
export class FormService {
    currentIp: string;
    private pages: WebItem[] = [];

    constructor() {

    }

    public markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
          control.markAsTouched();
      
          if ((control as any).controls) {
            (control as any).controls.forEach(c => this.markFormGroupTouched(c));
          }
        });
    }

    public validateForm(formToValidate: FormGroup, formErrors: any, checkDirty?: boolean) {
        const form = formToValidate;
        for (const field in formErrors) {
          if (field) {
            formErrors[field] = '';
            const control = form.get(field);
            const messages = this.validationMessages();
            if (control && !control.valid) {
              if (!checkDirty || (control.dirty || control.touched)) {
                for (const key in control.errors) {
                  if (key && key !== 'invalid_characters') {
                    formErrors[field] = formErrors[field] || messages[key];
                  } else {
                    formErrors[field] = formErrors[field] || messages[key](control.errors[key]);
                  }
                }
              }
            }
          }
        }
    
        return formErrors;
    }

    public validationMessages() {
        const messages = {
          required: 'Ce champ est requis',
          email: 'This email address is invalid',
          alreadyInUse:  (matches: any[]) => {
            // if (matches.length) {
            //   return 'Cette valeur est déjà utilisée';
            // }
          },
          invalid_characters: (matches: any[]) => {
            let matchedCharacters = matches;
            matchedCharacters = matchedCharacters.reduce((characterString, character, index) => {
              let string = characterString;
              string += character;
              if (matchedCharacters.length !== index + 1) {
                string += ', ';
              }
              return string;
            }, '');
    
            return `These characters are not allowed: ${matchedCharacters}`;
          },
        };
    
        return messages;
    }

    checkExists(items: WebItem[], item: WebItem, property: string, checkId: boolean, control: AbstractControl) {
        const found = checkId 
            ? items.find(p => p.id !== item.id && p[property].toLowerCase() === control.value.toLowerCase())
            : items.find(p => p[property].toLowerCase() === control.value.toLowerCase());
        return found !== undefined ? {alreadyInUse: true} : null;
    }
}
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Adherent } from '@app/core/models/adherent.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { BehaviorSubject } from 'rxjs';
import { CheckAdherent } from '../models/check-adherent.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InscriptionService {
    private obsAdherent: BehaviorSubject<Adherent> = new BehaviorSubject<Adherent>(new Adherent(null));
    public obsAddMember: BehaviorSubject<Adherent> = new BehaviorSubject<Adherent>(null);
    private adherents: Adherent[] = [];
    requiredAlert: string = 'Ce champ est requis';
    phoneInputMask = '00 00 00 00 00||(+99) 0 00 00 00 00';
    cpInputMask = '00000';
    //licenceInputMask = '000000';
    filemaxsize = 5242880;
    public manualFill: boolean = false;
    patterns = { 
        'saison': { pattern: /[0-9]{4}/ },
        'postalcode': { pattern: /[0-9]{5}/ },
        'localpostalcode': { pattern: /31770/ },
        'licence': { pattern: /[0-9]{6,}/},
        'onlystring': { pattern: /[a-zA-Z- '"]/ },
        'telfixe': { pattern: /^(0|(\d){2})(1|2|3|4|5|6|7|9)([0-9]{2}){4}/ },
        'mobile': { pattern: /^0(6|7)([0-9]{2}){4}/ },
        'alert': { pattern: /.{1,} (0|\(\+(\d){2}\))(1|2|3|4|5|6|7|9)(\s{0,1}[0-9]{2}){4}/},
        'email': { pattern: /^(?:[A-z0-9!#$%&'*\/=?^_{|}~]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")[\.\_\-\+]?(?:[A-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[A-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[A-z0-9](?:[A-z0-9-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[A-z0-9-]*[A-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/ } 
    };
    sections: string[] = [
      'Animation parc Duroch',
      'Ateliers (Calligraphie, Peinture, Peinture sur Porcelaine)',
      'Chorale Italienne',
      'Colomiers Danse Club',
      'Danse à Claquettes',
      'Danse Country',
      'Échecs',
      'Galerie 99',
      'Gourmandise et Œnologie',
      'Les Anciens du Foyer',
      'Les Gardiens du jeu',
      'Patchwork',
      'Pêche à la mouche',
      'Radioamateurs',
      'Retraite Active',
      'Sérigraphie',
      'Tennis de table',
      'Volley-ball',
      'Yoga'
    ];
    

  constructor(
    private modalService: ModalService,
    private adherentService: AdherentService) {
    this.adherentService.getListe().then(list => {
        this.adherents = list;
    });
  }

  setManualFill(value: boolean) {
    this.manualFill = value;
  }

  getManualFill(): boolean {
    return this.manualFill;
  }

  getAdherent(): Adherent {
    return this.obsAdherent.value;
  }

  setAdherent(adherent: Adherent) {
    this.obsAdherent.next(adherent);
  }

  getExistingAdherent(adherent: Adherent): Adherent {
    if (adherent && adherent.FirstName && adherent.LastName && adherent.BirthdayDate) {
        return this.adherents.find(a => a.BirthdayDate && this.normalize(a.FirstName) === this.normalize(adherent.FirstName) 
        && this.normalize(a.LastName) === this.normalize(adherent.LastName) 
        && this.compareDate(a.BirthdayDate, adherent.BirthdayDate) === 0);
    }
    return null;
  }

  findAdo(nom: string, prenom: string, birthday: Date): Adherent {
    if (nom && prenom && birthday) {
        return this.adherents.find(a => this.normalize(a.FirstName) === this.normalize(prenom) 
        && this.normalize(a.LastName) === this.normalize(nom) 
        && this.compareDate(a.BirthdayDate, birthday) === 0);
    }
    return null;
  }

  getInputError(formGroup: FormGroup, field: string) {
    return formGroup.get(field).hasError('required') ? this.requiredAlert :
        formGroup.get(field).hasError('pattern') ? 'Le format est invalide' : '';
  }

  getLicenceError(formGroup: FormGroup, field: string) {
    return formGroup.get(field).hasError('format') ? 'Le format est invalide' : 
    formGroup.get(field).hasError('licence') ? 'Le n° de licence ne correspond pas' : '';
  }

  getCpError(formGroup: FormGroup, field: string, local: boolean) {
    return formGroup.get(field).hasError('required') ? this.requiredAlert :
        formGroup.get(field).hasError('pattern') ? 
        (local ? 'Le format est invalide ou ce code postal ne correspond pas ce qui a été déclaré à l\'étape précédente' : 'Le format est invalide') : '';
  }

  getDateError(formGroup: FormGroup, field: string): string | boolean {
    return formGroup.get(field).hasError('required') ? this.requiredAlert : 
    formGroup.get(field).hasError('date-minimum') ? 'L\'adhérent(e) doit être agé(e) d\'au moins 13 ans à la fin de cette année' : 
    formGroup.get(field).hasError('date-section') ? 'L\'âge ne convient pas à la section choisie' : 
    formGroup.get(field).hasError('date-adulte') ? 'Le payeur doit être majeur' : '';
  }

  getFileError(formGroup: FormGroup, field: string): string | boolean {
    return formGroup.get(field).hasError('required') ? this.requiredAlert : 
    formGroup.get(field).hasError('maxContentSize') ? 'Le poids du fichier ne doit pas excéder 5Mo' : '';
  }

  getCheckError(formGroup: FormGroup, field: string): string | boolean {
    return formGroup.get(field).hasError('required') ? 'L\'acceptation est requise' : '';
  }

  getPatternError(formGroup: FormGroup, field: string, required: boolean = false): string | boolean {
    return formGroup.get(field).hasError('pattern') ? 'Le format est invalide' : '';
  }

  compareDate(d1: Date, d2: Date): number {
    if (d1 && d2) {
        const _d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const _d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        return _d1.getTime() === _d2.getTime() ? 0 : (_d1.getTime() > _d2.getTime() ? 1 : -1);
    } else if (!d1) {
        return -1;
    } else {    
        return 1;
    }
  }

  checkControl(formGroup: FormGroup, field: string) {
    const control = formGroup.get(field);
    //if (!control.hasError) {
        control.updateValueAndValidity({ onlySelf: true});
        if (control.hasError) {
            control.markAsTouched();
        }
    //}
  }

  checkAdherent(check: CheckAdherent, adherent: Adherent, step: number): CheckAdherent {
    if (!check) {
        check = new CheckAdherent();
    }

    // Recherche de l'adhérent dans les données
    if (!check.found) {
        check.found = this.getExistingAdherent(adherent);
        console.log('found: ', check.found);
        if (check.found && !adherent.IdAdherent) {
            adherent.IdAdherent = check.found.IdAdherent;
            if (check.found.Uid) {
                adherent.Uid = check.found.Uid;
            } else if (!adherent.Uid) {
                adherent.Uid = uuidv4();
            }
        }
    }
    check.certifLabel = 'Attestation ou certificat';
    check.certifPlaceHolder = 'Importer un certificat médical ou une attestation de santé';
    let dateValid = false;
    const d = new Date();
    let nextY = d.getFullYear() + (d.getMonth() > 5 ? 0 : 1);

    

    // Traitement certificat
    check.certifNeeded = false;
    // if (adherent.HealthFile || adherent.CertificateFile) {
    //     check.certifNeeded = false;
    // } else {
    //     if (check.found && check.found.CertificateDate) {
    //         const certifDate = check.found.CertificateDate;
    //         const currentY = check.found.CertificateDate.getFullYear() + 3;
    //         const expire = new Date(currentY, certifDate.getMonth(), certifDate.getDay());
    //         const endOfSeason = new Date(nextY, 5, 30);
    //         const valid = this.compareDate(expire, endOfSeason);
    //         check.certifLabel = valid >= 0 ? 'Certificat médical / attestation de santé' : 'Certificat médical';
    //         check.certifPlaceHolder = valid >= 0 ? 'Importer un certificat médical ou une attestation de santé' : 'Importer un certificat médical';
    //         check.certifNeeded = valid < 0;
    //     } else {
    //         check.certifLabel = 'Certificat médical';
    //         check.certifPlaceHolder = 'Importer un certificat médical';
    //         check.certifNeeded = this.isNull(adherent.HealthFile) && this.isNull(adherent.CertificateFile);
    //     }
    // }
    
    // Traitement licence
    //check.licenceNeeded = ['C', 'E'].includes(adherent.Category) && this.isNull(adherent.Licence);
    check.licenceNeeded = false;
    check.licenceError = false;
    if (check.found && adherent.Licence && check.found.Licence && adherent.Licence !== 'création') {
        check.licenceError = adherent.Licence !== check.found.Licence;
    }

    nextY = d.getFullYear() + (d.getMonth() > 5 ? 1 : 0);

    // Traitement date de naissance
    if (adherent.BirthdayDate) {
        const date18 = new Date(nextY - 18, 6, 1);
        const date13 = new Date(nextY - 13, 11, 31);
        if (['C', 'L'].includes(adherent.Category)) {
            dateValid = this.compareDate(date18, adherent.BirthdayDate) > 0;
            check.parentAuthNeeded = false;
        } else if (adherent.Category === 'E') {
            dateValid = this.compareDate(date18, adherent.BirthdayDate) <= 0 && this.compareDate(date13, adherent.BirthdayDate) >= 0;
            check.parentAuthNeeded = this.isNull(adherent.Authorization);
        }
        check.age = Adherent.getAge(adherent.BirthdayDate);
    }

    // Traitement signature
    check.signatureNeeded = adherent.Age > 18 && !adherent.Signature || false;

    // Traitement accept
    check.accept = adherent.Rgpd;

    check.birthdayDateValid = dateValid;
    check.valid = dateValid && (step === 3 ? 
        !check.parentAuthNeeded 
            //&& !check.certifNeeded 
            && !check.licenceNeeded 
            && !check.licenceError 
            && !check.signatureNeeded 
            && check.accept 
        : true);
    return check;
  }

  private normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  public isNull(value): boolean {
    return value === null || value === undefined || value === '';
  }
}
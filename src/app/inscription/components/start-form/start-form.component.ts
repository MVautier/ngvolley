import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Adherent } from '@app/core/models/adherent.model';
import { AdherentService } from '@app/core/services/adherent.service';
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
  @Output() validate: EventEmitter<StartInscription> = new EventEmitter<StartInscription>();
  birthday: Date;
  selectedSection: string;
  sections: string[] = [];
  sectionsWithoutVolley: string[] = [];
  city: string = environment.city;
  asso = environment.asso;
  year: string;
  public isMobile = false;
  reinscription: boolean = environment.reinscription;
  inscriptionFilter: string = environment.inscriptionFilter;
  inscriptionFilterIds: number[] = [];
  showForm = false;
  adofound: Adherent = undefined;
  notFoundError: boolean = false;
  liens: string[] = ['Pére', 'Mère', 'Frère mineur', 'Soeur mineure'];
  selectedLien: string;
  notFoundText = 'Un nom, un prénom et une date de naissance valides doivents être fournis pour la réinscription.';

  constructor(
    private inscriptionService: InscriptionService,
    private adherentService: AdherentService,
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
      this.inscriptionFilterIds = this.inscriptionFilter && this.inscriptionFilter !== '*' ? this.inscriptionFilter.split(',').map((x) => parseInt(x)) : [];
      console.log('filter ids: ', this.inscriptionFilterIds);
      if (this.reinscription && environment.debug) {
        this.start.nom = 'lacroix';
        this.start.prenom = 'stephanie';
        this.birthday = new Date(1974, 5, 4);
      }
      this.showForm = !this.reinscription;
      const y = this.adherentService.obsSeason.value;
      this.year = y.toString() + '-' + (y + 1).toString();
      this.sections = this.inscriptionService.sections;
      this.sectionsWithoutVolley = this.inscriptionService.sections.filter(s => s !== 'Volley-ball');
    }
  }

  onValidateAdo() {
    this.notFoundError = false;
    if (this.start.nom && this.start.prenom && this.birthday) {
      this.inscriptionService.findAdo(this.start.nom, this.start.prenom, this.birthday).then(result => {
        this.adofound = result;
        if (this.adofound && this.inscriptionFilterIds.length) {
          if (!this.inscriptionFilterIds.find(id => id === this.adofound.IdAdherent)) {
            this.adofound = null;
          }
        }
        if (this.adofound) {
          this.start.nom = this.adofound.LastName;
          this.start.prenom = this.adofound.FirstName;
          this.start.found = this.adofound;
          this.showForm = true;
        } else {
          this.notFoundError = true;
          this.showForm = false;
        }
      });
    } else {
      this.adofound = undefined;
      this.notFoundError = true;
      this.showForm = false;
    }
  }

  resetAlready() {
    this.start.already = false;
    this.selectedSection = null;
    this.start.section = null;
    console.log('resetAlready: already: ', this.start.already, ' - already2: ', this.start.already2);
  }

  resetAlready2() {
    this.start.already2 = false;
    this.start.section = null;
    this.start.nom2 = null;
    this.start.prenom2 = null;
    this.start.lien = null;
    this.selectedSection = null;
    console.log('resetAlready2: already: ', this.start.already, ' - already2: ', this.start.already2);
  }

  setLien() {
    this.start.lien = this.selectedLien;
  }

  setSection() {
    this.start.section = this.selectedSection;
  }

  checkForm(): boolean {
    let valid = true;
    if (this.start.already) {
      return this.start.section != null;
    } else if (this.start.already2) {
      return this.start.nom2 && this.start.prenom2 && this.start.lien != null && this.start.section != null;
    }
    return valid;
  }

  onValidate() {
    this.validate.emit(this.start);
  }
}

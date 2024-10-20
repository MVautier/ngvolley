import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { UtilService } from '@app/core/services/util.service';
import { AdherentFilter } from '@app/core/models/adherent-filter.model';
import { Operator } from '@app/core/models/operator.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { Subscription } from 'rxjs';
import { EnumPayment } from '@app/core/enums/payment.enum';
import { environment } from '@env/environment';

@Component({
  selector: 'app-adherent-filter',
  templateUrl: './adherent-filter.component.html',
  styleUrls: ['./adherent-filter.component.scss']
})
export class AdherentFilterComponent implements OnInit, OnDestroy {

  @Input() filter: AdherentFilter;
  @Output() change: EventEmitter<AdherentFilter> = new EventEmitter<AdherentFilter>();
  @Output() apply: EventEmitter<AdherentFilter> = new EventEmitter<AdherentFilter>();
  maxDate: Date = new Date();
  firstSeason: number = environment.firstSeason;
  showFilter = false;
  hasPhoto = 'tous';
  hasLicence = 'tous';
  Categorie = 'tous';
  Section = 'tous';
  payment = 'tous';
  Saison: string;
  saison?: number;
  Equipe: string = null;
  teams: string[] = [];
  seasons: number[] = [];
  customFields = [
    { columnDef: 'LastName', header: 'Nom' },
    { columnDef: 'FirstName', header: 'Prénom' },
  ];
  selectedCustomField = this.customFields[0];
  operators: Operator[] = [
    { label: 'Est égal à', value: 'Equals' },
    { label: 'Commence par', value: 'StartsWith' },
    { label: 'Finit par', value: 'EndsWith' },
    { label: 'Contient', value: 'Contains' }
  ];
  subFilter: Subscription;

  @ViewChild('input') input: ElementRef;
  constructor(private adherentService: AdherentAdminService, private adhService: AdherentService, private util: UtilService) {
    this.subFilter = this.adherentService.obsFilter.subscribe(filter => {
      this.filter = filter;
      this.setVariablesByFilter();
    });
  }

  ngOnInit(): void {
    this.teams = this.adhService.obsTeams.value;
    this.saison = this.adhService.obsSeason.value;
    this.Saison = this.saison ? this.saison.toString() : null;
    //this.initFilter();
    this.initSeasons();
  }

  ngOnDestroy(): void {
    if (this.subFilter) {
      this.subFilter.unsubscribe();
    }
  }

  initFilter() {
    this.filter = new AdherentFilter(this.saison, this.selectedCustomField.columnDef);
    this.filter.Payment = EnumPayment.Tous;
    this.payment = 'tous';
    this.hasPhoto = 'tous';
    this.hasLicence = 'tous';
    this.Categorie = 'tous';
    this.Section = 'tous';
    this.Equipe = 'tous';
    this.initSeasons();
    this.selectedCustomField = this.customFields[0];
  }

  initSeasons() {
    this.seasons = [this.saison];
    let season = this.saison;
    while (season > this.firstSeason) {
      season--;
      this.seasons.push(season);
    }
  }

  setVariablesByFilter() {
    if (this.filter) {
      this.Saison = this.filter.Saison ? this.filter.Saison.toString() : '0';
      this.payment = this.getVarPayment();
      this.hasPhoto = this.filter.HasPhoto === null ? 'tous' : (this.filter.HasPhoto ? 'avec' : 'sans');
      this.hasLicence = this.filter.HasLicence === null ? 'tous' : (this.filter.HasLicence ? 'avec' : 'sans');
      this.Categorie = this.filter.IdCategory === null ? 'tous' : (this.filter.IdCategory === 1 ? 'C' : (this.filter.IdCategory === 2 ? 'L' : 'E'));
      this.Section = this.filter.IdSection === null ? 'tous' : (this.filter.IdSection === 1 ? '16' : (this.filter.IdSection === 2 ? '18' : (this.filter.IdSection === 3 ? 'A' : 'O')));
      this.Equipe = this.filter.Team || 'tous';
    }
  }

  getVarPayment(): string {
    let pay = 'tous';
    if (this.filter) {
      switch (this.filter.Payment) {
        case EnumPayment.Termine:
          pay = 'termine';
          break;
        case EnumPayment.Attente:
          pay = 'attente';
          break;
        case EnumPayment.Autre:
          pay = 'autre';
          break;
        case EnumPayment.Manuel:
          pay = 'manuel';
          break;
        case EnumPayment.Tous:
          pay = 'tous';
          break;
      }
    }

    return pay;
  }

  getPayment(event: any): EnumPayment {
    let pay = EnumPayment.Tous;
    switch (event.value) {
      case 'termine':
        pay = EnumPayment.Termine;
        break;
      case 'attente':
        pay = EnumPayment.Attente;
        break;
      case 'autre':
        pay = EnumPayment.Autre;
        break;
      case 'manuel':
        pay = EnumPayment.Manuel;
        break;
      case 'tous':
        pay = EnumPayment.Tous;
        break;
    }

    return pay;
  }

  onOptionChange(field: string, event: any) {
    if (field === 'payment') {
      this.filter.Payment = this.getPayment(event);
    } else if (field === 'equipe') {
      this.filter.Team = event.value === 'tous' ? null : event.value;
    } else if (field === 'photo') {
      this.filter.HasPhoto = event.value === 'tous' ? null : (event.value === 'avec' ? true : false);
    } else if (field === 'licence') {
      this.filter.HasLicence = event.value === 'tous' ? null : (event.value === 'avec' ? true : false);
    } else if (field === 'category') {
      this.filter.IdCategory = event.value === 'tous' ? null : (event.value === 'C' ? 1 : (event.value === 'L' ? 2 : 3));
    } else if (field === 'section') {
      this.filter.IdSection = event.value === 'tous' ? null : (event.value === '16' ? 1 : (event.value === '18' ? 2 : (event.value === 'A' ? 3 : 4)));
    } else if (field === 'custom') {
      this.filter.DynamicFilter.Field = event.value.columnDef;
    } else if (field === 'season') {
      this.filter.Saison = event.value === '0' ? null : event.value;
    }
    console.log('option changed: ', this.filter);
  }

  onShowFilter() {
    this.showFilter = true;
    console.log('current filter: ', this.filter);
  }

  onHideFilter() {
    this.showFilter = false;
  }

  resetFilter() {
    this.initFilter();
    this.change.emit(this.filter);
    this.apply.emit(this.filter);
    this.showFilter = false;
  }

  validateCustom(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.setFilter();
    }
  }

  setFilter() {
    this.filter.DynamicFilter.Value = this.input.nativeElement.value;
    this.change.emit(this.filter);
    this.apply.emit(this.filter);
    this.showFilter = false;
  }

  onDateChange(mode: string, event: any) {
    const d = this.util.UtcDate(new Date(event.target.value));
    if (mode === 'start') {
      this.filter.DateRange.Start = d;
    }
    if (mode === 'end') {
      this.filter.DateRange.End = d;
    }
  }

  setDate(event: any, type: string) {
    if (!this.filter.DateRange) {
      this.filter.DateRange = {
        Start: null,
        End: null
      }
    }
    if (type === 'start') {
      this.filter.DateRange.Start = event.value;
    } else {
      this.filter.DateRange.End = event.value;
    }
  }
}

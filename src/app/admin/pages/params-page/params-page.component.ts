import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Adherent } from '@app/core/models/adherent.model';
import { Parameters } from '@app/core/models/parameters.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-params-page',
    templateUrl: './params-page.component.html',
    styleUrls: ['./params-page.component.scss'],
    standalone: false
})
export class ParamsPageComponent implements OnInit {

  public params: Parameters;
  isMobile = false;
  formGroup: FormGroup;

  filterAll = true;
  selectedAdherents: { id: number; displayName: string }[] = [];
  searchNom = '';
  searchPrenom = '';
  searchBirthday: Date = null;
  searchResult: Adherent | null = null;
  searchError = false;
  searching = false;

  constructor(private adherentService: AdherentService, private fb: FormBuilder, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (window.matchMedia('(max-width: 1025px)').matches) {
      this.isMobile = true;
    }
    this.adherentService.getParams().then(result => {
      this.params = result;
      this.initForm();
    });
  }

  initForm() {
    if (this.params) {
      this.formGroup = this.fb.group({
        'InscriptionOpened': [this.params.InscriptionOpened],
        'Reinscription': [this.params.Reinscription],
        'InscriptionFilter': [this.params.InscriptionFilter],

        'AdoOpened': [this.params.AdoOpened, [Validators.required]],
        'LoisirOpened': [this.params.LoisirOpened, [Validators.required]],
        'CompetOpened': [this.params.CompetOpened, [Validators.required]],
        'NbAdoMax': [this.params.NbAdoMax, [Validators.required]],

        'TarifLocal': [this.params.TarifLocal, [Validators.required]],
        'TarifExterior': [this.params.TarifExterior, [Validators.required]],
        'TarifMember': [this.params.TarifMember, [Validators.required]],
        'TarifAdo': [this.params.TarifAdo, [Validators.required]],
        'TarifLoisir': [this.params.TarifLoisir, [Validators.required]],
        'TarifLicense': [this.params.TarifLicense, [Validators.required]],

        'SubHeader': [this.params.SubHeader],
        'Text1': [this.params.Text1],
        'Text2': [this.params.Text2],
        'Text3': [this.params.Text3]
      });

      const filterValue = this.params.InscriptionFilter;
      if (!filterValue || filterValue === '*') {
        this.filterAll = true;
        this.selectedAdherents = [];
      } else {
        this.filterAll = false;
        this.selectedAdherents = filterValue.split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(id => !isNaN(id))
          .map(id => ({ id, displayName: `ID : ${id}` }));
      }
    }
  }

  onFilterModeChange() {
    this.updateFilterControl();
  }

  canSearch(): boolean {
    return !!this.searchNom?.trim() && !!this.searchPrenom?.trim() && !!this.searchBirthday;
  }

  async onSearchAdherent() {
    if (!this.canSearch()) return;
    this.searchResult = null;
    this.searchError = false;
    this.searching = true;
    try {
      const result = await this.adherentService.searchAdherent(
        this.searchNom.trim(),
        this.searchPrenom.trim(),
        this.searchBirthday
      );
      if (result) {
        this.searchResult = result;
      } else {
        this.searchError = true;
      }
    } catch {
      this.searchError = true;
    } finally {
      this.searching = false;
    }
  }

  addToFilter(adherent: Adherent) {
    if (!this.selectedAdherents.find(a => a.id === adherent.IdAdherent)) {
      this.selectedAdherents = [...this.selectedAdherents, {
        id: adherent.IdAdherent,
        displayName: `${adherent.FirstName} ${adherent.LastName}`
      }];
      this.updateFilterControl();
    }
    this.searchResult = null;
    this.searchNom = '';
    this.searchPrenom = '';
    this.searchBirthday = null;
  }

  removeFromFilter(id: number) {
    this.selectedAdherents = this.selectedAdherents.filter(a => a.id !== id);
    this.updateFilterControl();
  }

  private updateFilterControl() {
    const value = this.filterAll
      ? '*'
      : this.selectedAdherents.map(a => a.id).join(',') || '';
    this.formGroup.patchValue({ InscriptionFilter: value });
  }

  onFormSubmit(formValue: any) {
    const params = Parameters.fromJson(formValue);
    params.IdParametre = this.params?.IdParametre || 0;
    console.log('new params: ', params);
    this.adherentService.setParams(params).then(result => {
      this.params = result;
      this.initForm();
      this.toastr.success('Enregistrement réussi', 'Paramètres');
    }).catch(err => {
      console.log('error saving params: ', err);
      this.toastr.error('Erreur: ' + err.message, 'Paramètres');
    });
  }
}

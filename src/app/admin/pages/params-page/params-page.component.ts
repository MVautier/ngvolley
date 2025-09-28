import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parameters } from '@app/core/models/parameters.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-params-page',
  templateUrl: './params-page.component.html',
  styleUrls: ['./params-page.component.scss']
})
export class ParamsPageComponent implements OnInit {

  public params: Parameters;
  isMobile = false;
  formGroup: FormGroup;

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
        'InscriptionFilter': [this.params.InscriptionFilter, [Validators.required]],

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


        'SubHeader': [this.params.SubHeader, [Validators.required]],
        'Text1': [this.params.Text1, [Validators.required]],
        'Text2': [this.params.Text2, [Validators.required]],
        'Text3': [this.params.Text3, [Validators.required]]
      });
    }

  }

  onFormSubmit(formValue: any) {
    const params = Parameters.fromJson(formValue);
    params.IdParametre = this.params?.IdParametre || 0;
    console.log('new params: ', params)
    this.adherentService.setParams(params).then(result => {
      this.params = result;
      this.initForm();
      this.toastr.success('Enregistrement réussi', 'Paramètres');
    }).catch(err => {
      console.log('error saving params: ', err)
      this.toastr.error('Erreur: ' + err.message, 'Paramètres');
    });
    //console.log(JSON.stringify(formValue, null, 2));
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StartInscription } from '@app/inscription/models/start-inscription.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss']
})
export class StartFormComponent implements OnInit {
  @Input() start: StartInscription;
  @Output() validate: EventEmitter<StartInscription> = new EventEmitter<StartInscription>();
  nom: string;
  prenom: string;
  section: string;
  alreadySigned = false;
  formGroup: FormGroup;
  sections: string[] = [];
  city: string = environment.city;
  asso = environment.asso;

  constructor(
    private inscriptionService: InscriptionService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.start) {
      this.sections = this.inscriptionService.sections;
      this.formGroup = this.formBuilder.group({
        'local': [this.start.local, [Validators.required]],
        'nom': [this.start.nom, [Validators.required]],
        'prenom': [this.start.prenom, [Validators.required]],
        'section': [this.start.section, [Validators.required]]
      });
    }
    
  }
  getInputError(field: string) {
    return this.inscriptionService.getInputError(this.formGroup, field);
  }

  onCancel() {
    this.alreadySigned = false;
  }


  onValidate() {
    const info = this.getFormValue();
    this.validate.emit(info);
  }

  getFormValue(): StartInscription {
    return {
      local: this.start.local,
      nom: this.formGroup.get('nom').value,
      prenom: this.formGroup.get('prenom').value,
      section: this.formGroup.get('section').value
    };
  }
}

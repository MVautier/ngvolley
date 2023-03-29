import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { PdfInfo } from '@app/core/models/pdf-info.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit {
  @Input() adherent: Adherent;
  @Output() validate: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  @Output() cancel: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  isFormValid = false;

  constructor(
    private inscriptionService: InscriptionService,
    private pdf: PdfMakerService) { }

  ngOnInit(): void {
    this.setValid();
  }

  onSavePdf(data: PdfInfo, id: string) {
    if (data && data.element && data.name) {
      console.log('data received from modal: ', data);
      const name = 'test.pdf';
      this.pdf.buildAndSendPdf(id, data.name, data.element).then(result => {
          console.log('pdf was built and sent to server: ', result);
      })
      .catch(err => {
          console.log('error buildAndSendPdf: ', err);
      });
    } else {
      console.log('no data for SavePdf');
    }
  }

  onAdherentChange(adherent: Adherent) {
    this.adherent = adherent;
    this.setValid();
  }

  onMemberChange(member: Adherent) {
    const index = this.adherent.Membres.findIndex(m => m.Uid === member.Uid);
    if (index >= 0) {
        this.adherent.Membres[index] = member;
    }
    this.setValid();
  }

  setValid() {
    let valid = this.checkValid(this.adherent);
    if (valid && this.adherent.Membres.length) {
        for(let i = 0; i < this.adherent.Membres.length; i++) {
            valid = this.checkValid(this.adherent.Membres[i]);
            if (!valid) {
                break;
            }
        }
    }

    this.isFormValid = valid;
  }

  checkValid(adh: Adherent): boolean {
    const checked = this.inscriptionService.checkAdherent(null, this.adherent, 3);
    return checked.valid && !this.inscriptionService.isNull(adh.Photo);
  }

  onCancel() {
    this.cancel.emit(this.adherent);
  }

  onValidate() {

  }
}

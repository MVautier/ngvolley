import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { PdfInfo } from '@app/core/models/pdf-info.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
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

  async ngOnInit() {
    await this.setValid();
  }

  onSavePdf(data: PdfInfo, id: string) {
    if (data && data.element && data.name) {
      console.log('data received from modal: ', data);
      const name = 'test.pdf';
      this.pdf.buildAndSendPdf(id + '/' + this.adherent.Saison.toString(), data.name, data.element).then(result => {
        console.log('pdf was built and sent to server: ', result);
      })
        .catch(err => {
          console.log('error buildAndSendPdf: ', err);
        });
    } else {
      console.log('no data for SavePdf');
    }
  }

  async onAdherentChange(adherent: Adherent) {
    this.adherent = adherent;
    await this.setValid();
  }

  async onMemberChange(member: Adherent) {
    const index = this.adherent.Membres.findIndex(m => m.Uid === member.Uid);
    if (index >= 0) {
      this.adherent.Membres[index] = member;
    }
    await this.setValid();
  }

  async setValid() {
    let valid = await this.checkValid(this.adherent);
    if (valid && this.adherent.Membres.length) {
      for (let i = 0; i < this.adherent.Membres.length; i++) {
        valid = await this.checkValid(this.adherent.Membres[i]);
        if (!valid) {
          break;
        }
      }
    }

    this.isFormValid = valid;
  }

  onSignature(s: string) {
    this.adherent.Signature = s;
    this.setValid();
  }

  async checkValid(adh: Adherent): Promise<boolean> {
    const checked = await this.inscriptionService.checkAdherent(null, this.adherent, 3);
    return checked.valid && !this.inscriptionService.isNull(adh.Photo);
  }

  onCancelDoc() {
    this.cancel.emit(this.adherent);
  }

  onValidate() {
    // show payment modal
    this.validate.emit(this.adherent);
  }

}

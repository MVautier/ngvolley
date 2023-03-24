import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { PdfInfo } from '@app/core/models/pdf-info.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';

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

  constructor(private pdf: PdfMakerService) { }

  ngOnInit(): void {
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

  onCancel() {
    this.cancel.emit(this.adherent);
  }

  onValidate() {

  }
}

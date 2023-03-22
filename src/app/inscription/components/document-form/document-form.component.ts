import { Component, Input, OnInit } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit {
  @Input() adherent: Adherent;
  isFormValid = false;

  constructor(private pdf: PdfMakerService) { }

  ngOnInit(): void {
  }

  onSavePdf(div: HTMLElement, id: string) {
    if (div && div.innerHTML) {
      console.log('data received from modal: ', div.innerHTML);
      const name = 'test.pdf';
      this.pdf.buildAndSendPdf(id, name, div).then(result => {
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

  }

  onValidate() {

  }
}

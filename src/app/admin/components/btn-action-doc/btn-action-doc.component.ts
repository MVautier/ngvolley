import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdherentDoc } from '@app/core/models/adherent-doc.model';
import { UtilService } from '@app/core/services/util.service';

@Component({
  selector: 'app-btn-action-doc',
  templateUrl: './btn-action-doc.component.html',
  styleUrls: ['./btn-action-doc.component.scss']
})
export class BtnActionDocComponent implements OnInit {
    @Input() doc: AdherentDoc;
    @Output() download: EventEmitter<AdherentDoc> = new EventEmitter<AdherentDoc>();
    @Output() upload: EventEmitter<AdherentDoc> = new EventEmitter<AdherentDoc>();
    @Output() generate: EventEmitter<void> = new EventEmitter<void>();

    selectedFile: File | null = null;
  constructor(private util: UtilService) { }

  ngOnInit(): void {
  }

  onDownload() {
    this.download.emit(this.doc);
  }

  onUpload() {
    this.upload.emit(this.doc);
  }

  onGenerate() {
    this.generate.emit();
  }

  handleFileInput(event: any) {
    if (this.doc.type) {
        this.selectedFile = event.target?.files[0];
        console.log('selected file: ', this.selectedFile);
        if (this.selectedFile) {
            this.util.readFile(this.selectedFile).then(blob => {
                if (blob) {
                    this.doc.blob = blob;
                    this.doc.filename = `${this.doc.type}.pdf`
                    this.upload.emit(this.doc);
                } 
            }); 
        }
    }
}

}

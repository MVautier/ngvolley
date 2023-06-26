import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdherentDoc } from '@app/core/models/adherent-doc.model';

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
  constructor() { }

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

}

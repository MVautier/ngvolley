import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { Adherent } from '@app/core/models/adherent.model';
import { FileService } from '@app/core/services/file.service';
import { UtilService } from '@app/core/services/util.service';

@Component({
  selector: 'app-adherent-card',
  templateUrl: './adherent-card.component.html',
  styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
  @Input() adherent: Adherent;
  @Output() hide: EventEmitter<void> = new EventEmitter<void>();
  photo_default = 'assets/images/user-default.png';
  photo: string;

  constructor(
    private adherentAdminService: AdherentAdminService, 
    private utilService: UtilService,
    private fileService: FileService) { }

  ngOnInit(): void {
    const photoDoc = this.adherent?.Documents?.find(d => d.type === 'photo');
    if (photoDoc) {
        this.adherentAdminService.downloadFile(this.adherent.Uid, photoDoc.filename).then(blob => {
            this.utilService.blobToDataURL(blob, (result) => {
                if (result) {
                    this.photo = result;
                }
            });
          }).catch(err => {
            
          });
    }
  }

  download(filename: string) {
    this.adherentAdminService.downloadFile(this.adherent.Uid, filename).then(blob => {
        this.fileService.download(blob, filename);
      }).catch(err => {
        console.error(err);
      });
  }

  returnToListe() {
    this.hide.emit();
  }

}

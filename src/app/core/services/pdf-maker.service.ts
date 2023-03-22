
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import domtoimage from 'dom-to-image';
import { HttpDataService } from './http-data.service';

import jsPDF from 'jspdf';

@Injectable()
export class PdfMakerService {

  constructor(private http: HttpDataService<any>) {

  }

  buildAndSendPdf(id: string, name: string, item: HTMLElement): Promise<string> {
    return new Promise((resolve, reject) => {
        this.captureHTML(item).then(base64 => {
            this.buildPdf(base64).then((blob) => {
                const formData = this.getFormData(id, name, blob);
                this.sendPdf(formData).then((file) => {
                    resolve(file);
                })
                .catch(err => {
                    reject('error sending pdf: ' + JSON.stringify(err));
                });
            })
            .catch(err => {
                reject('error building pdf: ' + JSON.stringify(err));
            });
        })
        .catch(err => {
            reject('error capturing html: ' + JSON.stringify(err));
        });
    });
  }

  private captureHTML(item: HTMLElement): Promise<string> {
    var scale = 2;
    return domtoimage.toPng(item, {
      bgcolor: '#fff',
      width: item.clientWidth * scale,
      height: item.clientHeight * scale,
      style: {
        transform: 'scale('+scale+')',
        transformOrigin: 'top left'
      }
    }).then(dataUrl => {
      return dataUrl;
    }).catch(err => {
      throw err;
    });
  }

  private buildPdf(base64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const ratio = 0.75292857248934;
      const img = new Image();
      img.onload = () => {
        const doc = new jsPDF("p", "pt", "a4", true);
        const imgWidth = img.naturalWidth * ratio / 2;
        const imgHeight = img.naturalHeight * ratio / 2;
        doc.addImage(base64, 25, 50, imgWidth, imgHeight, null, 'SLOW');
        doc.setFontSize(7);
        const blob = new Blob([doc.output('blob')], {type: 'application/pdf'});
        resolve(blob);
      };
      img.onerror = (err) => {
        reject('error building pdf: ' + JSON.stringify(err));
      }
      img.src = base64;
    });
  }

  private getFormData(id: string, name: string, blob: Blob): FormData {
    var formData = new FormData();
    formData.append('filename', name);
    formData.append('id', id);
    formData.append(name, blob, name);
    return formData;
  }

  private async sendPdf(data: FormData): Promise<string> {
    // return new Promise((resolve, reject) => {
    //     resolve();
    // });
    return this.http.post<FormData>(environment.apiUrl + 'Document/SavePDF', data);
  }
}
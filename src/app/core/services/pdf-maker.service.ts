
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import domtoimage from 'dom-to-image';
import { HttpDataService } from './http-data.service';

import jsPDF from 'jspdf';
import { PdfFooter } from '../models/pdf-footer.model';
import { DatePipe } from '@angular/common';

@Injectable()
export class PdfMakerService {
    heightP: number = 826;
    heightL: number = 826;
    scale = 2;
    ratio = 0.75292857248934;
  constructor(
    private datePipe: DatePipe,
    private http: HttpDataService<any>) {

  }

  buildAndSendPdf(id: string, name: string, item: HTMLElement): Promise<string> {
    return new Promise((resolve, reject) => {
        const footer = this.getFooter(item, 'p');
        this.captureHTML(item).then(base64 => {
            this.buildPdf(base64, footer).then((blob) => {
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
    const dates = item.querySelectorAll('input');
    dates.forEach(d => {
        if (d.className.includes('error')) {
            d.className = d.className.replace(' error', '');
        }
        if (d.type !== 'radio') {
            let v = (d as HTMLInputElement).value;
            const label = d.className.includes('telephone') ? 'Fixe: ' : (d.className.includes('mobile') ? 'Mobile: ' : '');
            if (d.type === 'date') {
                v = this.datePipe.transform(v, 'dd/MM/yyyy', 'fr-FR');
            }
            if (v) {
                d.insertAdjacentText('afterend', ' ' + label + v);
            }
            
            d.remove();
        }
        
    });

    return domtoimage.toPng(item, {
      bgcolor: '#fff',
      width: item.clientWidth * this.scale,
      height: item.clientHeight * this.scale,
      style: {
        transform: 'scale('+this.scale+')',
        transformOrigin: 'top left'
      }
    }).then(dataUrl => {
      return dataUrl;
    }).catch(err => {
      throw err;
    });
  }

  private buildPdf(base64: string, footer: PdfFooter): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const doc = new jsPDF("p", "pt", "a4", true);
        const imgWidth = img.naturalWidth * this.ratio / this.scale;
        const imgHeight = img.naturalHeight * this.ratio / this.scale;
        doc.addImage(base64, 25, 50, imgWidth, imgHeight, null, 'SLOW');
        if (footer) {
            doc.setFontSize(7);
            doc.text(footer.text, 25, 826, {});
        }
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
    return this.http.post<FormData>(environment.apiUrl + 'Document/SavePDF', data, { responseType:'text' });
  }

  private getFooter(item: HTMLElement, orientation: string): PdfFooter {
    const footer = (item.querySelector('.footer') as HTMLDivElement);
    if (footer) {
        const h = getComputedStyle(footer, null).getPropertyValue('height');
        console.log('footer height: ', h);
        const top = this.px2pt(h, orientation);
        console.log('top: ', top);
        const text = footer.innerText;
        footer.remove();
        return {
            text: text,
            top: top
        };
    }
    return null;
  }

  private px2pt(px: string, orientation: string): number {
    if (px) {
        if (px.endsWith('px')) {
            px = px.replace('px', '');
        }
        const h = Number(px);
        return (orientation === 'p' ? this.heightP : this.heightL) - (h * 72 / 96);
    }
    return orientation === 'p' ? this.heightP : this.heightL;
  }
}
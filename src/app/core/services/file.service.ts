import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  download(response: Blob, filename: string) {
    if (response) {
      const dataType = response.type;
      const binaryData = [];
      binaryData.push(response);
      const downloadLink = window.document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      if (filename) {
        downloadLink.setAttribute('download', filename);
      }
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
    }
  }
}

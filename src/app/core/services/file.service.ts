import { Injectable } from '@angular/core';
import { HttpDataService } from './http-data.service';
import { environment } from '@env/environment';
import { AdherentDoc } from '../models/adherent-doc.model';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor(private http: HttpDataService<any>) { }

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


    public async sendDoc(data: FormData): Promise<string> {
        return this.http.post<FormData>(environment.apiUrl + 'Document/SaveDocument', data, { responseType: 'text' });
    }

    public async sendDocs(data: FormData): Promise<boolean> {
        return this.http.post<FormData>(environment.apiUrl + 'Document/SaveDocuments', data, { responseType: 'text' });
    }

    getFormData(id: string, name: string, blob: Blob): FormData {
        var formData = new FormData();
        formData.append('filename', name);
        formData.append('id', id);
        formData.append(name, blob, name);
        return formData;
    }

    getFormDataMultiple(id: string, files: AdherentDoc[]): FormData {
        var formData = new FormData();
        let added = false;
        formData.append('id', id);
        files.forEach(file => {
            if (!file.sent && file.blob instanceof Blob) {
                formData.append(file.filename, file.blob, file.filename);
                added = true;
            }
        });
        return added ? formData : null;
    }
}

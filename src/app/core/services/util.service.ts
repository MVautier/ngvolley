import { Adherent } from "../models/adherent.model";

export class UtilService {
    db = require('mime-db')

    public dataURLtoBlob(dataurl: string) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    public blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {callback(e.target.result);}
        a.readAsDataURL(blob);
    }

    public mime2ext(dataurl: string): string {
        var arr = dataurl.split(','), m = arr[0].match(/:(.*?);/)[1];
        const exts = this.db[m];
        if ( exts && exts.extensions.length) {
            return exts.extensions[0];
        }
        return null;
    }

    bindDates(adherent: Adherent): Adherent {
        if (adherent) {
            adherent.BirthdayDate = this.bindDate(adherent.BirthdayDate?.toString());
            adherent.InscriptionDate = this.bindDate(adherent.InscriptionDate?.toString());
            adherent.CertificateDate = this.bindDate(adherent.CertificateDate?.toString());
        }
        return adherent;
    }

    bindDate(date: string): Date {
        if (date) {
            return this.UtcDate(new Date(date));
        }
        return null;
    }

    public readFile(file: File | Blob): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                resolve(new Blob([new Uint8Array(e.target.result)], {type: file.type }));
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsArrayBuffer(file);
        });
        
    }

    date2String(d: Date, fr: boolean = false): string {
        let s = '';
        if (d) {
            const m = d.getMonth() + 1;
            const j = d.getDate();
            const y = d.getFullYear();
            const sm = (m < 10 ? '0' : '') + m.toString();
            const sj = (j < 10 ? '0' : '') + j.toString();
            if (fr) {
                return sj + '/' + sm + '/' + y;
            } else {
                return y + '-' + sm + '-' + sj;
            }
            
        }
        return s;
    }

    public UtcDate(date: Date): Date {
        if (!date) return null;
        const UTCDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()) - date.getTimezoneOffset();
        return new Date(UTCDate);
    }
}
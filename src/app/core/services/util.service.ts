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

    datesEquals(d1: Date | string, d2: Date | string): boolean {
        const _d1 = new Date(d1);
        const _d2 = new Date(d2);
        return _d1.getFullYear() === _d2.getFullYear() && _d1.getMonth() === _d2.getMonth() && _d1.getDate() === _d2.getDate();
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

    date2String(d: Date | string, fr: boolean = false): string {
        const date = typeof d === 'string' ? this.string2Date(d) : d;
        let s = '';
        if (date) {
            const m = date.getMonth() + 1;
            const j = date.getDate();
            const y = date.getFullYear();
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

    /**
     * Construit un Date en heure locale a partir d'une chaine "yyyy-MM-dd", sans jamais
     * passer par `new Date(string)` (parsee en UTC par le moteur JS, source du bug de
     * decalage corrige dans toute l'app). A utiliser pour pre-remplir un datepicker Material
     * a partir d'un champ modele de type string.
     */
    string2Date(s: string): Date {
        if (!s) return null;
        const parts = s.split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return null;
        const [y, m, d] = parts;
        return new Date(y, m - 1, d);
    }

    date2StringForFilter(d: Date): string {
        let s = '';
        if (d) {
            const m = d.getMonth() + 1;
            const j = d.getDate();
            const y = d.getFullYear();
            const sm = (m < 10 ? '0' : '') + m.toString();
            const sj = (j < 10 ? '0' : '') + j.toString();
            return y + sm + sj;
            
        }
        return s;
    }

    /**
     * JSON.parse qui ne leve pas d'exception sur un contenu corrompu ou incompatible
     * (ex: localStorage rempli par une version anterieure de l'application).
     */
    public safeJsonParse<T>(value: string | null): T | null {
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch (err) {
            console.error('safeJsonParse: contenu invalide, ignore: ', value, err);
            return null;
        }
    }
}
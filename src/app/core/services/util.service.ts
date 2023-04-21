
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
}
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ThemeService } from '@app/core/services/theme.service';
import SignaturePad from "signature_pad";

@Component({
    selector: 'app-signature-form',
    templateUrl: './signature-form.component.html',
    styleUrls: ['./signature-form.component.scss'],
    host: {
        '(keyup.ctrl.k)': 'clear()'
    }
})
export class SignatureFormComponent implements OnInit {
    @Input() signature: string;
    @Output() changed: EventEmitter<string> = new EventEmitter<string>();
    @ViewChild("canvas", { static: true }) canvas: ElementRef;
    sig: SignaturePad;
    penColor: string = 'black';
    bgColor: string = 'rgb(255,255,255)';

    constructor(private themeService: ThemeService) { }

    ngOnInit(): void {
        const dark = this.themeService.getTheme();
        //this.bgColor = dark ? '' : '';
        this.sig = new SignaturePad(this.canvas.nativeElement, { penColor: this.penColor, backgroundColor: this.bgColor });
        if (this.signature) {
            this.sig.fromDataURL(this.signature);
        }
        this.sig.addEventListener("endStroke", () => {
            console.log("Signature ended");
            const signature = this.sig.toDataURL();
            console.log('signature: ', signature);
            this.changed.emit(signature);
          });
    }

    clear() {
        this.sig.clear();
        this.sig.on();
        this.changed.emit(null);
    }
}

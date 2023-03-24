import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild("canvas", { static: true }) canvas: ElementRef;
  sig: SignaturePad;
  penColor: string = 'black';
  bgColor: string = 'rgb(255,255,255)';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    const dark = this.themeService.getTheme();
    //this.bgColor = dark ? '' : '';
    this.sig = new SignaturePad(this.canvas.nativeElement, {penColor: this.penColor, backgroundColor: this.bgColor});
  }

  clear() {
    this.sig.clear();
  }
}

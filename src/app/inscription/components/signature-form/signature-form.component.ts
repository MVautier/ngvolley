import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    this.sig = new SignaturePad(this.canvas.nativeElement);
  }

  clear() {
    this.sig.clear();
  }
}

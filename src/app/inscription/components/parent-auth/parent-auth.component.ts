import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ParentAuth } from '@app/core/models/parent-auth.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { UtilService } from '@app/core/services/util.service';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';

//import SignaturePad from "signature_pad";

@Component({
  selector: 'app-parent-auth',
  templateUrl: './parent-auth.component.html',
  styleUrls: ['./parent-auth.component.scss']
})
export class ParentAuthComponent implements OnInit {
  config: ModalConfig;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  firstnameError = false;
  lastnameError = false;
  childfirstnameError = false;
  childlastnameError = false;
  statutError = false;
  telError = false;
  datenaissance: string;
  datenaissanceError = false;
  cityError = false;
  date: string;
  sigError = false;
  phoneInputMask = '00 00 00 00 00||(+99) 0 00 00 00 00';
  data: ParentAuth;
  now: Date = new Date();
  authorize: boolean = true;

  constructor(
    private datePipe: DatePipe,
    private util: UtilService,
    private pdf: PdfMakerService) { }

  ngOnInit(): void {
    //this.sig = new SignaturePad(this.canvas.nativeElement);
    console.log('data in auth-parent: ', this.config?.data);
    if (this.config?.data) {
      this.data = new ParentAuth(this.config.data);
      this.datenaissance = this.util.date2String(this.config.data.BirthdayDate);
      this.date = this.util.date2String(this.now);
    }
  }

  checkValid(): boolean {
    this.firstnameError = (this.data.firstname || '').length < 2;
    this.lastnameError = (this.data.lastname || '').length < 2;
    this.statutError = this.data.status === undefined;
    const telfixe = this.data.telfixe || '';
    const mobile = this.data.mobile || '';
    this.telError = telfixe.length < 10 && mobile.length < 10
    this.childfirstnameError = (this.data.child_firstname || '').length < 2;
    this.childlastnameError = (this.data.child_lastname || '').length < 2;
    this.datenaissanceError = this.datenaissance === undefined;
    this.cityError = (this.data.commune || '').length < 2;
    //this.data.signature = '';
    this.sigError = this.data.signature === undefined || this.data.signature === null;
    return !this.firstnameError
      && !this.lastnameError
      && !this.statutError
      && !this.telError
      && !this.childfirstnameError
      && !this.childlastnameError
      && !this.datenaissanceError
      && !this.cityError
      && !this.sigError;
  }

  onSignature(s: string) {
    this.data.signature = s;
    this.checkValid();
  }

  onValidate() {
    if (this.checkValid()) {
      this.data.date = this.datePipe.transform(this.now, 'dd/MM/yyyy');
      this.data.child_birthdate = this.datePipe.transform(this.datenaissance, 'dd/MM/yyyy');
      this.data.authorize = this.authorize;
      this.pdf.buildParentAuth(this.data).then(blob => {
        if (blob) {
          this.validate({
            action: 'parentauth',
            data: blob
          });
        }
      });
    }
  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: null
    });
  }
}

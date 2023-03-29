import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';

import SignaturePad from "signature_pad";

@Component({
  selector: 'app-parent-auth',
  templateUrl: './parent-auth.component.html',
  styleUrls: ['./parent-auth.component.scss']
})
export class ParentAuthComponent implements OnInit {
  config: ModalConfig;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  firstname = '';
  lastname = '';
  firstnameError = false;
  lastnameError = false;
  childfirstname = '';
  childlastname = '';
  childfirstnameError = false;
  childlastnameError = false;
  statut: string;
  statutError = false;
  telfixe: string;
  telError = false;
  mobile: string;
  datenaissance: string;
  datenaissanceError = false;
  city: string;
  cityError = false;
  date: string;
  dateError = false;
  @ViewChild("canvas", { static: true }) canvas: ElementRef;
  sig: SignaturePad;
  sigError = false;
  phoneInputMask = '00 00 00 00 00||(+99) 0 00 00 00 00';

  constructor() { }

  ngOnInit(): void {
    this.sig = new SignaturePad(this.canvas.nativeElement);
    console.log('data in auth-parent: ', this.config?.data);
    if (this.config?.data) {
        this.childfirstname = this.config.data.FirstName;
        this.childlastname = this.config.data.LastName;
        this.datenaissance = this.date2String(this.config.data.BirthdayDate);
    }
    this.date = this.date2String(new Date());
  }

  date2String(d: Date): string {
    let s = '';
    if (d) {
        const m = d.getMonth() + 1;
        const j = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m.toString() + '-' + (j < 10 ? '0' : '') + j.toString();
    }
    return s;
  }

  isInValid(): boolean {
      this.firstnameError = (this.firstname || '').length < 2;
      this.lastnameError = (this.lastname || '').length < 2;
      this.statutError = this.statut === undefined;
      const telfixe =  this.telfixe || '';
      const mobile = this.mobile || '';
      this.telError = telfixe.length < 10 && mobile.length < 10
      this.childfirstnameError = (this.childfirstname || '').length < 2;
      this.childlastnameError = (this.childlastname || '').length < 2;
      this.datenaissanceError = this.datenaissance === undefined;
      this.cityError = (this.city || '').length < 2;
      this.dateError = this.date === undefined;
      this.sigError = this.sig['_data']?.length === 0;
      return this.firstnameError 
        || this.lastnameError
        || this.statutError
        || this.telError
        || this.childfirstnameError
        || this.childlastnameError
        || this.datenaissanceError
        || this.cityError
        || this.dateError
        || this.sigError;
  }


  onValidate() {
    if (!this.isInValid()) {
      const div = document.querySelector('#content-auth') as HTMLDivElement;
      this.validate({
        action: 'sendpdf',
        data: {
            element: div,
            name: 'autorisation-parentale.pdf'
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

  clear() {
    this.sig.clear();
  }
}

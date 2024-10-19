import { Component, OnInit } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';

@Component({
  selector: 'app-popup-error',
  templateUrl: './popup-error.component.html',
  styleUrls: ['./popup-error.component.scss']
})
export class PopupErrorComponent implements OnInit {
  config: ModalConfig;
  validate: (result: ModalResult) => {};
  cancel: (result: ModalResult) => {};

  constructor() { }

  ngOnInit(): void {
  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: false
    });
  }
}

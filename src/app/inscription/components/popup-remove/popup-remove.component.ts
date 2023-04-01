import { Component, OnInit } from '@angular/core';
import { ModalConfig } from '@app/ui/layout/models/modal-config.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';

@Component({
  selector: 'app-popup-remove',
  templateUrl: './popup-remove.component.html',
  styleUrls: ['./popup-remove.component.scss']
})
export class PopupRemoveComponent implements OnInit {
    config: ModalConfig;
    validate: (result: ModalResult) => {};
    cancel: (result: ModalResult) => {};
  constructor() { }

  ngOnInit(): void {
  }

  onValidate() {
    this.validate({
      action: 'validate',
      data: true
    });
  }

  onCancel() {
    this.cancel({
      action: 'cancel',
      data: false
    });
  }

}

import { Component, OnInit, makeStateKey } from '@angular/core';

import { TransferStateService } from '@app/core/services/transfert-state.service';

@Component({
    selector: 'app-custom-error',
    templateUrl: './custom-error.component.html',
    styleUrls: ['./custom-error.component.scss'],
    standalone: false
})
export class CustomErrorComponent implements OnInit {

  constructor(private transferState: TransferStateService) { }

  ngOnInit(): void {
    const errorKey = makeStateKey<any>('CUSTOM_ERRORS');
    const errors = this.transferState.get(errorKey, []);
    console.log('errors in custom-error: ', errors)
  }

}

import { Component, Inject, OnInit, Optional, makeStateKey } from '@angular/core';

import { TransferStateService } from '@app/core/services/transfert-state.service';
import { RESPONSE } from '../../../../../express.tokens';
import { Response } from 'express';
import { SsrService } from '../../services/ssr.service';

@Component({
  selector: 'app-custom-error',
  templateUrl: './custom-error.component.html',
  styleUrls: ['./custom-error.component.scss']
})
export class CustomErrorComponent implements OnInit {

  constructor(
    @Optional() @Inject(RESPONSE) private response: Response,
    private transferState: TransferStateService,
    private ssrService: SsrService) { }

  ngOnInit(): void {
    const errorKey = makeStateKey<any>('CUSTOM_ERRORS');
    const errors = this.transferState.get(errorKey, []);
    console.log('errors in custom-error: ', errors)
    if (this.ssrService.isServer()) {
      console.log('custom-error in server side');
      if (this.response) {
        console.log('response: ', this.response);
      }
    } else {
      console.log('custom-error in client side');
    }
  }

}

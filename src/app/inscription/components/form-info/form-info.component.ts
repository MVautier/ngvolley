import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-form-info',
    templateUrl: './form-info.component.html',
    styleUrls: ['./form-info.component.scss'],
    standalone: false
})
export class FormInfoComponent implements OnInit {
    @Input() isMobile: boolean;
    isMobileOpened = false;
  constructor() { }

  ngOnInit(): void {
  }

}

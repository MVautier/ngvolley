import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  public isVisible: boolean = false;
  public showLoader: boolean = false;

  constructor(
    private loaderService: LoaderService
  ) {
    this.loaderService.loaderStatus().subscribe((loaderStatus) => {            
        this.showLoader = this.isVisible = loaderStatus;
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Slider } from '@app/ui/layout/models/slider.model';
import { SliderService } from '@app/ui/layout/services/slider.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  slider: Slider;
  constructor(private slideService: SliderService) { }

  ngOnInit(): void {
    this.initSlides();
  }

  initSlides() {
    this.slideService.init().then(slider => {
      if (slider) {
        console.log('api is ok');
        this.slider = slider;
      } else {
        console.log('api unavailable');
      }
      
    });
  }
  onSwiper(swiper) {
    console.log(swiper);
  }
  onSlideChange() {
    console.log('slide change');
  }

}

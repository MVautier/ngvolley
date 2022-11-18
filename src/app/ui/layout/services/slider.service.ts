import { Injectable } from '@angular/core';
import { ApiPingService } from '@app/core/services/api-ping.service';
import { environment } from '@env/environment';
import SwiperCore, { SwiperOptions, Autoplay, Pagination, Navigation } from 'swiper';
import { Slider } from '../models/slider.model';
SwiperCore.use([Autoplay, Pagination, Navigation]);

@Injectable()
export class SliderService {
  config: SwiperOptions = {
    // autoplay: {
    //   delay: 2500,
    //   disableOnInteraction: false
    // },
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
  };

  constructor(private pingService: ApiPingService) {

  }

  init(): Promise<Slider> {
    return new Promise((resolve) => {
        this.pingService.getApiStatus().then(() => {
            const path = environment.apiRoot;
            const slides = [
              {src: path + 'medias/slides/IMG20211204173221-2048x1152.jpg', title: 'photo 1'},
              {src: path + 'medias/slides/Bloc-Volley.jpg', title: 'photo 2'},
              {src: path + 'medias/slides/Volley-1-1-1536x789.jpg', title: 'photo 3'},
              {src: path + 'medias/slides/IMG-20190927-WA0002.jpg', title: 'photo 4'},
              {src: path + 'medias/slides/SAM_4586.jpg', title: 'photo 5'},
              {src: path + 'medias/slides/SAM_3363.jpg', title: 'photo 6'},
              {src: path + 'medias/slides/Criterium-2018-5.jpg', title: 'photo 7'}
            ];
            resolve ({
                config: this.config,
                slides: slides
            });
        }).catch(err => {
            resolve(null);
        });
    });
  }

}
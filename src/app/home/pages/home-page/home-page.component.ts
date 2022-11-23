import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { Slider } from '@app/ui/layout/models/slider.model';
import { SliderService } from '@app/ui/layout/services/slider.service';
import { ThemeService } from '@app/ui/layout/services/theme.service';
import { distinctUntilChanged, Observable, Subject, tap } from 'rxjs';
import { MatGridList } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  slider: Slider;
  isDarkTheme: Observable<boolean>;
  public displayMode = 'desktop';
  cols: number;
  tiles: string[] = [
    'Hi there!',
    'I\'m a custom component',
    'Toggle the dark theme',
    'This background is the accent color',
    'The borders have card background color',
    'The font is \'Pacifico\'',
    'The tile list scrolls vertically',
    'This is the last tile'
  ];

  Breakpoints = Breakpoints;
  currentBreakpoint:string = '';
  
  readonly breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, '(min-width: 500px)'])
    .pipe(
      tap(value => console.log(value)),
      distinctUntilChanged()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private slideService: SliderService, 
    private themeService: ThemeService) {

     }

  ngOnInit(): void {
    this.breakpoint$.subscribe((value) => {
      console.log('value: ', value);
      this.breakpointChanged();
    }
    );
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.initSlides();
  }

  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
      this.cols = 3;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
      this.cols = 2;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
      this.cols = 1;
    } else if(this.breakpointObserver.isMatched('(min-width: 500px)')) {
      this.currentBreakpoint = '(min-width: 500px)';
      this.cols = 1;
    } else {
      this.cols = 1;
    }
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

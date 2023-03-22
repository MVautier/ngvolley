import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoTakerComponent } from './photo-taker.component';

describe('PhotoTakerComponent', () => {
  let component: PhotoTakerComponent;
  let fixture: ComponentFixture<PhotoTakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotoTakerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoTakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

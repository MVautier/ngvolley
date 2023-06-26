import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnActionDocComponent } from './btn-action-doc.component';

describe('BtnActionDocComponent', () => {
  let component: BtnActionDocComponent;
  let fixture: ComponentFixture<BtnActionDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtnActionDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnActionDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

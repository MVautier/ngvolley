import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentPageComponent } from './adherent-page.component';

describe('AdherentPageComponent', () => {
  let component: AdherentPageComponent;
  let fixture: ComponentFixture<AdherentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

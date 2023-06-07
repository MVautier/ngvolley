import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentCardComponent } from './adherent-card.component';

describe('AdherentCardComponent', () => {
  let component: AdherentCardComponent;
  let fixture: ComponentFixture<AdherentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

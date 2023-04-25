import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentFilterComponent } from './adherent-filter.component';

describe('AdherentFilterComponent', () => {
  let component: AdherentFilterComponent;
  let fixture: ComponentFixture<AdherentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

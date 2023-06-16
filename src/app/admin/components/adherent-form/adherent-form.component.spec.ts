import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentFormComponent } from './adherent-form.component';

describe('AdherentFormComponent', () => {
  let component: AdherentFormComponent;
  let fixture: ComponentFixture<AdherentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

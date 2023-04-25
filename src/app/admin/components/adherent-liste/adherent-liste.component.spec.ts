import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentListeComponent } from './adherent-liste.component';

describe('AdherentListeComponent', () => {
  let component: AdherentListeComponent;
  let fixture: ComponentFixture<AdherentListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentListeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

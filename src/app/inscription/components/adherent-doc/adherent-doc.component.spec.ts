import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherentDocComponent } from './adherent-doc.component';

describe('AdherentCardComponent', () => {
  let component: AdherentDocComponent;
  let fixture: ComponentFixture<AdherentDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherentDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdherentDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

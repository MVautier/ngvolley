import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifPageComponent } from './tarif-page.component';

describe('TarifPageComponent', () => {
  let component: TarifPageComponent;
  let fixture: ComponentFixture<TarifPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarifPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

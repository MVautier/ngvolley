import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentAuthComponent } from './parent-auth.component';

describe('ParentAuthComponent', () => {
  let component: ParentAuthComponent;
  let fixture: ComponentFixture<ParentAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentAuthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

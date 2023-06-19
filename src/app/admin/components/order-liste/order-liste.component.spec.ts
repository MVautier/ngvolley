import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListeComponent } from './order-liste.component';

describe('OrderListeComponent', () => {
  let component: OrderListeComponent;
  let fixture: ComponentFixture<OrderListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderListeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

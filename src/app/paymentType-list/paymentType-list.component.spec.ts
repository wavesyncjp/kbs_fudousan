import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypeListComponent } from './paymentType-list.component';

describe('PaymentTypeListComponent', () => {
  let component: PaymentTypeListComponent;
  let fixture: ComponentFixture<PaymentTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

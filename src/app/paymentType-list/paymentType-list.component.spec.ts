import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentTypeListComponent } from './paymentType-list.component';

describe('PaymentTypeListComponent', () => {
  let component: PaymentTypeListComponent;
  let fixture: ComponentFixture<PaymentTypeListComponent>;

  beforeEach(waitForAsync(() => {
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

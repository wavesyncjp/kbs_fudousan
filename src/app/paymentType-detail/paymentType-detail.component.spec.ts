import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypeDetailComponent } from './paymentType-detail.component';

describe('PaymentTypeDetailComponent', () => {
  let component: PaymentTypeDetailComponent;
  let fixture: ComponentFixture<PaymentTypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

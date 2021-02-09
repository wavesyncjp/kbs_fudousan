import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PayContractDetailComponent } from './paycontract-detail.component';

describe('PayContractDetailComponent', () => {
  let component: PayContractDetailComponent;
  let fixture: ComponentFixture<PayContractDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PayContractDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayContractDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

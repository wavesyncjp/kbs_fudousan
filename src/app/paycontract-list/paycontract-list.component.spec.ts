import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PayContractListComponent } from './paycontract-list.component';

describe('PayContractListComponent', () => {
  let component: PayContractListComponent;
  let fixture: ComponentFixture<PayContractListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PayContractListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayContractListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayContractListComponent } from './paycontract-list.component';

describe('PayContractListComponent', () => {
  let component: PayContractListComponent;
  let fixture: ComponentFixture<PayContractListComponent>;

  beforeEach(async(() => {
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

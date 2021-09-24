import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReceiveContractDetailComponent } from './receivecontract-detail.component';

describe('ReceiveContractDetailComponent', () => {
  let component: ReceiveContractDetailComponent;
  let fixture: ComponentFixture<ReceiveContractDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveContractDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveContractDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

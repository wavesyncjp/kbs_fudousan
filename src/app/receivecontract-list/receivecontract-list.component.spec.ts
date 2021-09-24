import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReceiveContractListComponent } from './receivecontract-list.component';

describe('ReceiveContractListComponent', () => {
  let component: ReceiveContractListComponent;
  let fixture: ComponentFixture<ReceiveContractListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveContractListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveContractListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

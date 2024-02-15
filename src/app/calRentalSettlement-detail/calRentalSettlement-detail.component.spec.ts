import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalRentalSettlementDetailComponent } from './calRentalSettlement-detail.component';

describe('calRentalSettlementDetailComponent', () => {
  let component: CalRentalSettlementDetailComponent;
  let fixture: ComponentFixture<CalRentalSettlementDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalRentalSettlementDetailComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalRentalSettlementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

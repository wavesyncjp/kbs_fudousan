import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RentalSelectComponent } from './rental-select.component';

describe('RentalSelectComponent', () => {
  let component: RentalSelectComponent;
  let fixture: ComponentFixture<RentalSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RentalSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

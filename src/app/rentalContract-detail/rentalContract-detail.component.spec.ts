import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RentalContractDetailComponent } from './rentalContract-detail.component';

describe('RentalContractDetailComponent', () => {
  let component: RentalContractDetailComponent;
  let fixture: ComponentFixture<RentalContractDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RentalContractDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalContractDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

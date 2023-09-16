import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RentalInfoDetailComponent } from './rental-detail.component';

describe('RentalInfoDetailComponent', () => {
  let component: RentalInfoDetailComponent;
  let fixture: ComponentFixture<RentalInfoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RentalInfoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalInfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

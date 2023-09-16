import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RentalInfoListComponent } from './rental-list.component';

describe('RentalInfoListComponent', () => {
  let component: RentalInfoListComponent;
  let fixture: ComponentFixture<RentalInfoListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RentalInfoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

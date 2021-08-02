import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SortingDetailComponent } from './sorting-detail.component';

describe('SortingDetailComponent', () => {
  let component: SortingDetailComponent;
  let fixture: ComponentFixture<SortingDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SortingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

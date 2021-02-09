import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlanHistoryListComponent } from './planhistory-list.component';

describe('PlanHistoryListComponent', () => {
  let component: PlanHistoryListComponent;
  let fixture: ComponentFixture<PlanHistoryListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanHistoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

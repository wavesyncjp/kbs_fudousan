import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KanjyoFixDetailComponent } from './kanjyoFix-detail.component';

describe('KanjyoFixDetailComponent', () => {
  let component: KanjyoFixDetailComponent;
  let fixture: ComponentFixture<KanjyoFixDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KanjyoFixDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanjyoFixDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KanjyoDetailComponent } from './kanjyo-detail.component';

describe('KanjyoDetailComponent', () => {
  let component: KanjyoDetailComponent;
  let fixture: ComponentFixture<KanjyoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KanjyoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanjyoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

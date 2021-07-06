import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KanjyoFixListComponent } from './kanjyoFix-list.component';

describe('KanjyoFixListComponent', () => {
  let component: KanjyoFixListComponent;
  let fixture: ComponentFixture<KanjyoFixListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KanjyoFixListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanjyoFixListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

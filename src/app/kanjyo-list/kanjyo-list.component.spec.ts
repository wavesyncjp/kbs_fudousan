import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KanjyoListComponent } from './kanjyo-list.component';

describe('KanjyoListComponent', () => {
  let component: KanjyoListComponent;
  let fixture: ComponentFixture<KanjyoListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KanjyoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanjyoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

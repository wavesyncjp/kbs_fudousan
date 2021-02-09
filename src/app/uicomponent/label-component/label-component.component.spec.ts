import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LabelComponentComponent } from './label-component.component';

describe('MatcellComponentComponent', () => {
  let component: LabelComponentComponent;
  let fixture: ComponentFixture<LabelComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

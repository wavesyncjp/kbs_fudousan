import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatcellComponentComponent } from './matcell-component.component';

describe('MatcellComponentComponent', () => {
  let component: MatcellComponentComponent;
  let fixture: ComponentFixture<MatcellComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatcellComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatcellComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

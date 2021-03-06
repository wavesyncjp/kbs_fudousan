import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CodeDetailComponent } from './code-detail.component';

describe('CodeDetailComponent', () => {
  let component: CodeDetailComponent;
  let fixture: ComponentFixture<CodeDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

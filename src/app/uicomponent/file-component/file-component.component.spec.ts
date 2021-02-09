import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileComponentComponent } from './file-component.component';

describe('FileComponentComponent', () => {
  let component: FileComponentComponent;
  let fixture: ComponentFixture<FileComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FbListComponent } from './fb-list.component';

describe('FbListComponent', () => {
  let component: FbListComponent;
  let fixture: ComponentFixture<FbListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FbListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

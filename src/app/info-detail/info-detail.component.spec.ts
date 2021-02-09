import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InfoDetailComponent } from './info-detail.component';

describe('InfoDetailComponent', () => {
  let component: InfoDetailComponent;
  let fixture: ComponentFixture<InfoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

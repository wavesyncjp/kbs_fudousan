import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LocationDetailComponent } from './location-detail.component';

describe('LocationDetailComponent', () => {
  let component: LocationDetailComponent;
  let fixture: ComponentFixture<LocationDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

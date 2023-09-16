import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EvictionInfoDetailComponent } from './eviction-detail.component';

describe('EvictionInfoDetailComponent', () => {
  let component: EvictionInfoDetailComponent;
  let fixture: ComponentFixture<EvictionInfoDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EvictionInfoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvictionInfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

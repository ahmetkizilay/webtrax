import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDetailComponent } from './track_detail.component';

xdescribe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TrackDetailComponent]
    });
    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

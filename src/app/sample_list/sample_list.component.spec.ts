import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleListComponent } from './sample_list.component';

xdescribe('SampleListComponent', () => {
  let component: SampleListComponent;
  let fixture: ComponentFixture<SampleListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SampleListComponent]
    });
    fixture = TestBed.createComponent(SampleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

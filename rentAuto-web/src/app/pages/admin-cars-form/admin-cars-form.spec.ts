import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCarsForm } from './admin-cars-form';

describe('AdminCarsForm', () => {
  let component: AdminCarsForm;
  let fixture: ComponentFixture<AdminCarsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCarsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCarsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

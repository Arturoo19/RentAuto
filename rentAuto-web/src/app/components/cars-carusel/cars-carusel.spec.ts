import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsCarusel } from './cars-carusel';

describe('CarsCarusel', () => {
  let component: CarsCarusel;
  let fixture: ComponentFixture<CarsCarusel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsCarusel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsCarusel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

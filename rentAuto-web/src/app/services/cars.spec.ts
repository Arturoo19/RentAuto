import { TestBed } from '@angular/core/testing';

import { Cars } from './cars';

describe('Cars', () => {
  let service: Cars;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cars);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

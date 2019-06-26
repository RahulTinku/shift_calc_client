import { TestBed, inject } from '@angular/core/testing';

import { ListEmployeeService } from './list-employee.service';

describe('ListEmployeeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListEmployeeService]
    });
  });

  it('should be created', inject([ListEmployeeService], (service: ListEmployeeService) => {
    expect(service).toBeTruthy();
  }));
});

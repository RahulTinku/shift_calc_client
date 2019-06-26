import { TestBed, inject } from '@angular/core/testing';

import { AdduserService } from './adduser.service';

describe('AdduserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdduserService]
    });
  });

  it('should be created', inject([AdduserService], (service: AdduserService) => {
    expect(service).toBeTruthy();
  }));
});

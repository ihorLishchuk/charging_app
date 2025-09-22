import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { errorHandlingInterceptor } from './error-handling.interceptor';

describe('errorHandlingInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should call console error on any error interceptions', (done) => {
    const consoleError = spyOn(console, 'error');
    const url = 'https://dummy-url';
    const mockErrorResponse = { message: 'failed' };
    httpClient.get(url).subscribe({
      error: () => done(),
    });

    const req = httpTestingController.expectOne(() => true);
    req.flush({ message: mockErrorResponse.message }, { status: 400, statusText: '' });
    expect(consoleError).toHaveBeenCalledWith(`Failed with the next message: ${mockErrorResponse.message}`);
  });
});

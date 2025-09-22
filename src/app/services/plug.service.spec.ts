import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PlugService } from './plug.service';
import { PlugStatus } from '../entities';
import { MessageService } from './message.service';

class MockMessageService {
  show = jasmine.createSpy('show');
}

describe('PlugService', () => {
  let service: PlugService;
  let httpMock: HttpTestingController;
  let messageService: MockMessageService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlugService,
        { provide: MessageService, useClass: MockMessageService },
        provideHttpClient(withFetch()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PlugService);
    httpMock = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService) as unknown as MockMessageService;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load plugged-in EVs', () => {
    const mock: PlugStatus[] = [
      { chargerId: '1', evId: null },
      { chargerId: '2', evId: 'e42' }
    ];

    service.loadPluggedInEVs().subscribe(data => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne('http://localhost:3000/plugged-in-chargers');
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(service.status()).toEqual(mock);
  });

  it('should plugIn optimistically and confirm on success', () => {
    (service as any)._plugStatus.set([{ chargerId: '1', evId: null }]);

    service.plugIn('1', 'e1');

    expect(service.getPluggedEvId('1')).toBe('e1');

    const req = httpMock.expectOne('http://localhost:3000/plugged-in-chargers/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ evId: 'e1' });

    req.flush({ id: '1', chargerId: '1', evId: 'e1' });

    expect(messageService.show).toHaveBeenCalledWith(
      'success',
      jasmine.stringMatching(/plugged into charger 1/)
    );
  });

  it('should rollback on plugIn error', () => {
    (service as any)._plugStatus.set([{ chargerId: '1', evId: null }]);

    service.plugIn('1', 'e1');

    expect(service.getPluggedEvId('1')).toBe('e1');

    const req = httpMock.expectOne('http://localhost:3000/plugged-in-chargers/1');
    req.error(new ProgressEvent('Network error'));

    expect(service.getPluggedEvId('1')).toBeNull();
    expect(messageService.show).toHaveBeenCalledWith(
      'error',
      jasmine.any(String)
    );
  });

  it('should plugOut optimistically and confirm on success', () => {
    (service as any)._plugStatus.set([{ chargerId: '1', evId: 'e1' }]);

    service.plugOut('1');

    expect(service.getPluggedEvId('1')).toBeNull();

    const req = httpMock.expectOne('http://localhost:3000/plugged-in-chargers/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ evId: null });

    req.flush({ id: '1', chargerId: '1', evId: null });

    expect(messageService.show).toHaveBeenCalledWith(
      'info',
      jasmine.stringMatching(/unplugged/)
    );
  });

  it('should rollback on plugOut error', () => {
    (service as any)._plugStatus.set([{ chargerId: '1', evId: 'e1' }]);

    service.plugOut('1');

    expect(service.getPluggedEvId('1')).toBeNull();

    const req = httpMock.expectOne('http://localhost:3000/plugged-in-chargers/1');
    req.error(new ProgressEvent('Network error'));

    expect(service.getPluggedEvId('1')).toBe('e1');
    expect(messageService.show).toHaveBeenCalledWith(
      'error',
      jasmine.any(String)
    );
  });
});

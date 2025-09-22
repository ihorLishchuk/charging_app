import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ChargerService, EVService, PlugService } from '../../services';
import { StatusComponent } from './status.component';

class MockChargerService {
  chargers = signal([{ id: 'c1', name: 'Charger 1', maxRate: '50kW' }]);
  loadChargers = jasmine.createSpy().and.returnValue(of([{ id: 'c1', name: 'Charger 1', maxRate: '50kW' }]));
}

class MockEVService {
  evs = signal([{ id: 'e1', name: 'EV 1', batteryCapacity: '100kWh' }]);
  loadEVs = jasmine.createSpy().and.returnValue(of([{ id: 'e1', name: 'EV 1', batteryCapacity: '100kWh' }]));
  getById = jasmine.createSpy().and.callFake((id: string) =>
    id === 'e1' ? { id: 'e1', name: 'EV 1', batteryCapacity: '100kWh' } : undefined
  );
}

class MockPlugService {
  private plugged: Record<string, string> = {}; // chargerId -> evId

  loadPluggedInEVs = jasmine.createSpy().and.returnValue(of([]));

  plugIn(chargerId: string, evId: string) {
    this.plugged[chargerId] = evId;
  }

  plugOut(chargerId: string) {
    delete this.plugged[chargerId];
  }

  isPluggedIn(chargerId: string): boolean {
    return !!this.plugged[chargerId];
  }

  getPluggedEvId(chargerId: string): string | null {
    return this.plugged[chargerId] ?? null;
  }
}

describe('StatusComponent', () => {
  let fixture: ComponentFixture<StatusComponent>;
  let component: StatusComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusComponent],
      providers: [
        { provide: ChargerService, useClass: MockChargerService },
        { provide: EVService, useClass: MockEVService },
        { provide: PlugService, useClass: MockPlugService }
      ],
    })
      .overrideComponent(StatusComponent, {
        set: {
          providers: [
            { provide: ChargerService, useClass: MockChargerService },
            { provide: EVService, useClass: MockEVService },
            { provide: PlugService, useClass: MockPlugService },
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open and close modal', () => {
    expect(component.visibleModal()).toBeFalse();

    component.openModal('c1');
    expect(component.visibleModal()).toBeTrue();
    expect(component.modalChargerId()).toBe('c1');

    component.closeModal();
    expect(component.visibleModal()).toBeFalse();
    expect(component.modalChargerId()).toBeNull();
  });

  it('should handle plug in and out correctly', () => {
    component.openModal('c1');
    component.handlePlug('e1'); // plug EV into charger

    expect(component.isPluggedIn('c1')).toBeTrue();
    expect(component.chargerRelatedEV('c1')?.id).toBe('e1');

    component.plugOut('c1');
    expect(component.isPluggedIn('c1')).toBeFalse();
    expect(component.chargerRelatedEV('c1')).toBeUndefined();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { EVService } from '../../../services';
import { EvPlugInModalComponent } from './ev-plug-in-modal.component';

class MockEVService {
  evs = signal([{ id: '1', name: 'VW-Golf', batteryCapacity: '500kWh' }]);
}

describe('EvPlugInModalComponent', () => {
  let fixture: ComponentFixture<EvPlugInModalComponent>;
  let component: EvPlugInModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvPlugInModalComponent],
      providers: [{ provide: EVService, useClass: MockEVService }],
    }).overrideComponent(EvPlugInModalComponent, {
      set: {
        providers: [
          { provide: EVService, useClass: MockEVService }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(EvPlugInModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancel when onCancel is called', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit evSelected when onConfirm is called with selectedEvId', () => {
    spyOn(component.evSelected, 'emit');
    component.selectedEvId = '1';
    component.onConfirm();
    expect(component.evSelected.emit).toHaveBeenCalledWith('1');
  });

  it('should not emit evSelected when selectedEvId is null', () => {
    spyOn(component.evSelected, 'emit');
    component.selectedEvId = null;
    component.onConfirm();
    expect(component.evSelected.emit).not.toHaveBeenCalled();
  });
});

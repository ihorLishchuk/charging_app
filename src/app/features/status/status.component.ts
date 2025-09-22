import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest } from 'rxjs';

import { ChargerService, PlugService, EVService } from '../../services';
import { EV } from '../../entities';
import { EvPlugInModalComponent } from './modals/ev-plug-in-modal.component';

@Component({
  selector: 'app-status',
  standalone: true,
  templateUrl: './status.component.html',
  imports: [EvPlugInModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {
  private chargerService = inject(ChargerService);
  private evService = inject(EVService);
  private plugService = inject(PlugService);

  readonly chargers = this.chargerService.chargers;

  private modalVisible = signal(false);
  readonly visibleModal = this.modalVisible.asReadonly();
  readonly modalChargerId = signal<string | null>(null);

  constructor() {
    combineLatest({
      chargers: this.chargerService.loadChargers(),
      evs: this.evService.loadEVs(),
      status: this.plugService.loadPluggedInEVs()
    }).subscribe();
  }

  openModal(chargerId: string) {
    this.modalChargerId.set(chargerId);
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
    this.modalChargerId.set(null);
  }

  handlePlug(evId: string) {
    if (this.modalChargerId()) {
      this.plugService.plugIn(this.modalChargerId()!, evId);
    }
    this.closeModal();
  }

  isPluggedIn(chargerId: string): boolean {
    return this.plugService.isPluggedIn(chargerId);
  }

  plugOut(chargerId: string): void {
    return this.plugService.plugOut(chargerId);
  }

  chargerRelatedEV(id: string): EV | undefined {
    return this.evService.getById(
      this.plugService.getPluggedEvId(id) as string
    );
  }
}

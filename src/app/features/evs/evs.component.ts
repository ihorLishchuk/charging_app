import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { EVService } from '../../services';

@Component({
  selector: 'app-evs',
  standalone: true,
  templateUrl: './evs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvsComponent {
  private evService = inject(EVService);
  readonly evs = this.evService.evs;

  constructor() {
    this.evService.loadEVs().subscribe();
  }
}

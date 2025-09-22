import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChargerService } from '../../services';

@Component({
  selector: 'app-chargers',
  standalone: true,
  templateUrl: './chargers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChargersComponent {
  private chargerService = inject(ChargerService);
  readonly chargers = this.chargerService.chargers;

  constructor() {
    this.chargerService.loadChargers().subscribe();
  }
}

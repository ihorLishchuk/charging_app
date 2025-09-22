import { Component, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { EVService } from '../../../services';

@Component({
  selector: 'app-ev-plug-in-modal',
  standalone: true,
  templateUrl: './ev-plug-in-modal.component.html',
  styleUrls: ['./ev-plug-in-modal.component.scss'],
  imports: [FormsModule, FlexLayoutModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvPlugInModalComponent {
  evSelected = output<string>();
  cancel = output<void>();

  private evService = inject(EVService);
  readonly evs = this.evService.evs;

  selectedEvId: string | null = null;

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    if (this.selectedEvId !== null) {
      this.evSelected.emit(this.selectedEvId);
    }
  }
}

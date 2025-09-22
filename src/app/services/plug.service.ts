import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { PlugStatus } from '../entities';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'any' })
export class PlugService {
  private readonly http = inject(HttpClient);
  private readonly messages = inject(MessageService);

  private readonly API = 'http://localhost:3000/plugged-in-chargers';

  private readonly _plugStatus = signal<PlugStatus[]>([]);
  readonly status = computed(() => this._plugStatus());

  loadPluggedInEVs(): Observable<PlugStatus[]> {
    return this.http
      .get<PlugStatus[]>(this.API)
      .pipe(tap(data => this._plugStatus.set(data)));
  }

  plugIn(chargerId: string, evId: string): void {
    const prev = this.getPluggedEvId(chargerId);

    this.updateLocal(chargerId, evId);

    this.patch(chargerId, evId).subscribe({
      next: updated => {
        this.updateLocal(updated.chargerId ?? (updated as any).id, updated.evId ?? null);
        this.messages.show('success', `✅ EV ${evId} plugged into charger ${chargerId}.`);
      },
      error: err => {
        this.updateLocal(chargerId, prev);
        console.error('plugIn failed', err);
        this.messages.show('error', '❌ Failed to plug in. Please try again.');
      }
    });
  }

  plugOut(chargerId: string): void {
    const prev = this.getPluggedEvId(chargerId);

    this.updateLocal(chargerId, null);

    this.patch(chargerId, null).subscribe({
      next: updated => {
        this.updateLocal(updated.chargerId ?? (updated as any).id, updated.evId ?? null);
        this.messages.show('info', `ℹ️ Charger ${chargerId} unplugged.`);
      },
      error: err => {
        this.updateLocal(chargerId, prev);
        console.error('plugOut failed', err);
        this.messages.show('error', '❌ Failed to plug out. Please try again.');
      }
    });
  }

  getPluggedEvId(chargerId: string): string | null {
    return this._plugStatus().find(p => p.chargerId === chargerId)?.evId ?? null;
  }

  isPluggedIn(chargerId: string): boolean {
    return this.getPluggedEvId(chargerId) !== null;
  }

  private patch(chargerId: string, evId: string | null): Observable<PlugStatus> {
    return this.http.patch<PlugStatus>(
      `${this.API}/${encodeURIComponent(chargerId)}`,
      { evId }
    );
  }

  private updateLocal(chargerId: string, evId: string | null): void {
    this._plugStatus.update(list => {
      const idx = list.findIndex(s => s.chargerId === chargerId || (s as any).id === chargerId);
      if (idx === -1) {
        return [...list, { chargerId, evId }];
      }
      const next = list.slice();
      next[idx] = { ...list[idx], evId };
      return next;
    });
  }
}

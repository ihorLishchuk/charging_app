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

    this.applyLocal(chargerId, evId);

    this.patch(chargerId, evId).subscribe({
      next: updated => {
        this.mergeServer(updated);
        this.messages.show('success', `✅ EV ${evId} plugged into charger ${chargerId}.`);
      },
      error: err => {
        if (this.getPluggedEvId(chargerId) === evId) {
          this.applyLocal(chargerId, prev);
        }
        console.error('plugIn failed', err);
        this.messages.show('error', '❌ Failed to plug in. Please try again.');
      }
    });
  }

  plugOut(chargerId: string): void {
    const prev = this.getPluggedEvId(chargerId);

    this.applyLocal(chargerId, null);

    this.patch(chargerId, null).subscribe({
      next: updated => {
        this.mergeServer(updated);
        this.messages.show('info', `ℹ️ Charger ${chargerId} unplugged.`);
      },
      error: err => {
        if (this.getPluggedEvId(chargerId) === null) {
          this.applyLocal(chargerId, prev);
        }
        console.error('plugOut failed', err);
        this.messages.show('error', '❌ Failed to plug out. Please try again.');
      }
    });
  }

  getPluggedEvId(chargerId: string): string | null {
    // Could have been done via httpClient
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

  private applyLocal(chargerId: string, evId: string | null): void {
    let found = false;
    this._plugStatus.update(list => {
      const next = list.map(s => {
        if (s.chargerId === chargerId || (s as any).id === chargerId) {
          found = true;
          return { ...s, evId };
        }
        return s;
      });
      return next;
    });
    if (!found) {
      this._plugStatus.update(list => [...list, { chargerId, evId }]);
    }
  }

  private mergeServer(updated: PlugStatus): void {
    const chargerKey = (updated as any).chargerId ?? (updated as any).id;
    const normalized: PlugStatus = {
      chargerId: chargerKey,
      evId: (updated as any).evId ?? null
    };

    this._plugStatus.update(list => {
      const idx = list.findIndex(s => s.chargerId === chargerKey);
      if (idx === -1) return [...list, normalized];
      const next = list.slice();
      next[idx] = { ...list[idx], evId: normalized.evId };
      return next;
    });
  }
}

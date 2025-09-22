import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { EV } from '../entities';

@Injectable({ providedIn: 'any' })
export class EVService {
  private readonly _http = inject(HttpClient);
  private readonly _evs = signal<EV[]>([]);

  readonly evs = computed(() => this._evs());

  loadEVs(): Observable<EV[]> {
    return this._http.get<EV[]>('http://localhost:3000/evs')
      .pipe(tap(data => this._evs.set(data)));
  }

  getById(id: string): EV | undefined {
    return this._evs().find(ev => ev.id === id);
  }
}

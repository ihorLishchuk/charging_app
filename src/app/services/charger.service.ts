import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { Charger } from '../entities';

@Injectable({ providedIn: 'any' })
export class ChargerService {
  private readonly _http = inject(HttpClient);
  private readonly _chargers = signal<Charger[]>([]);

  readonly chargers = computed(() => this._chargers());

  loadChargers(): Observable<Charger[]> {
    return this._http.get<Charger[]>('http://localhost:3000/chargers')
      .pipe(tap(data => this._chargers.set(data)));
  }
}

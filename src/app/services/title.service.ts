import { Injectable, inject, computed } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'any' })
export class TitleService {
  private readonly router = inject(Router);

  private readonly navigationEnd$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.getDeepestRoute(this.router.routerState.snapshot.root))
  );
  private readonly currentRoute = toSignal(this.navigationEnd$, {
    initialValue: this.router.routerState.snapshot.root
  });

  readonly title = computed(() => {
    const route = this.currentRoute();
    return route?.data?.['title'] ?? '🔌 Charger List';
  });

  private getDeepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}

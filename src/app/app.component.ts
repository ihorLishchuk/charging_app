import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService, TitleService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- TODO: Move the navigation to a separate component -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-4">
      <a class="navbar-brand" routerLink="/">⚡ Charging App</a>
      <ul class="navbar-nav flex-row gap-3">
        <li class="nav-item"><a routerLink="/chargers" class="nav-link">Chargers</a></li>
        <li class="nav-item"><a routerLink="/evs" class="nav-link">EVs</a></li>
        <li class="nav-item"><a routerLink="/status" class="nav-link">Status</a></li>
      </ul>
    </nav>
    <div class="p-4">
      <h5>{{ titleService.title() }}</h5>
      <router-outlet />
      <!--  TODO: Move the notification to a separate component    -->
      @if (messageService.message(); as msg) {
        <div class="alert" [ngClass]="'alert-' + msg.type">
          {{ msg.text }}
        </div>
      }
    </div>
  `,
})
export class AppComponent {
  readonly titleService = inject(TitleService);
  readonly messageService = inject(MessageService);
}

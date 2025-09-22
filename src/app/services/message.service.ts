import { Injectable, signal } from '@angular/core';

export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly _message = signal<Message | null>(null);
  readonly message = this._message.asReadonly();

  show(type: Message['type'], text: string) {
    this._message.set({ type, text });

    setTimeout(() => this.clear(), 3000);
  }

  clear() {
    this._message.set(null);
  }
}

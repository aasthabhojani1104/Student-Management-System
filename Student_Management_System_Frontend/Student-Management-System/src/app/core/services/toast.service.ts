import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;

  success(message: string): void { this.add('success', message); }
  error(message: string):   void { this.add('error', message);   }
  warning(message: string): void { this.add('warning', message); }
  info(message: string):    void { this.add('info', message);    }

  private add(type: ToastType, message: string): void {
    const id = this.nextId++;
    const toast: Toast = { id, type, message, visible: true };
    this._toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this._toasts.update(list =>
      list.map(t => t.id === id ? { ...t, visible: false } : t)
    );
    setTimeout(() => {
      this._toasts.update(list => list.filter(t => t.id !== id));
    }, 300);
  }
}

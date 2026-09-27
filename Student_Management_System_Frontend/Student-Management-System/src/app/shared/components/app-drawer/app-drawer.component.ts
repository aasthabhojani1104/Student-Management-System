import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './app-drawer.component.html',
  styleUrls: ['./app-drawer.component.css']
})
export class AppDrawerComponent {
  @Input() open    = false;
  @Input() title   = '';
  @Input() width   = '480px';
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();

  close(): void { this.closed.emit(); }

  onBackdropClick(): void { this.close(); }
}

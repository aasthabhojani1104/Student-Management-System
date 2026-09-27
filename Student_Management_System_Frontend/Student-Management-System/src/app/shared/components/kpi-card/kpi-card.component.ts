import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {
  @Input() title    = '';
  @Input() value: string | number = '';
  @Input() icon     = 'info';
  @Input() iconBg   = '#6366f1';
  @Input() trend?: number;
  @Input() trendLabel = '';
  @Input() subtitle = '';
}

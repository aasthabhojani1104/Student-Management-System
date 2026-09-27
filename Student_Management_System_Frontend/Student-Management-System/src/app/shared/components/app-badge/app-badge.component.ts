import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-badge.component.html',
  styleUrls: ['./app-badge.component.css']
})
export class AppBadgeComponent {
  @Input() label = '';
  @Input() cssClass = 'badge-secondary';
}

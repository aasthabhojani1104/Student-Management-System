import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-skeleton.component.html',
  styleUrls: ['./app-skeleton.component.css']
})
export class AppSkeletonComponent {
  @Input() rows    = 5;
  @Input() cols    = 4;
  @Input() type: 'table' | 'card' | 'text' = 'table';

  get rowsArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get colsArray(): number[] {
    return Array(this.cols).fill(0);
  }
}

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppBadgeComponent } from '../app-badge/app-badge.component';
import { AppSkeletonComponent } from '../app-skeleton/app-skeleton.component';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'progress' | 'date' | 'actions' | 'number' | 'boolean' | 'avatar';
  cssClassKey?: string;
  imageKey?: string;   // for avatar type: key on the row that holds the image URL
  sortable?: boolean;
  width?: string;
}

export interface TableAction {
  icon: string;
  label: string;
  color?: string;
  action: string;
  condition?: (row: any) => boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, AppBadgeComponent, AppSkeletonComponent],
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.css']
})
export class AppTableComponent implements OnChanges {
  @Input() columns:  TableColumn[]  = [];
  @Input() data:     any[]          = [];
  @Input() actions:  TableAction[]  = [];
  @Input() loading   = false;
  @Input() title     = '';
  @Input() pageSize  = 10;
  @Input() showSearch = true;
  @Input() emptyMessage = 'No records found.';

  @Output() actionClicked = new EventEmitter<{ action: string; row: any }>();

  searchTerm  = '';
  currentPage = 1;
  sortKey     = '';
  sortDir: 'asc' | 'desc' = 'asc';

  pageSizeOptions = [10, 25, 50];

  get filtered(): any[] {
    let rows = [...this.data];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      rows = rows.filter(row =>
        this.columns.some(col =>
          col.type !== 'actions' && String(row[col.key] ?? '').toLowerCase().includes(term)
        )
      );
    }
    if (this.sortKey) {
      rows.sort((a, b) => {
        const av = a[this.sortKey] ?? '';
        const bv = b[this.sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }

  get paged(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.filtered.length);
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.currentPage = 1;
    }
  }

  sort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onAction(action: string, row: any): void {
    this.actionClicked.emit({ action, row });
  }

  getAvatarText(text: string): string {
    if (!text) return '?';
    return text.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(text: string): string {
    const colors = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
    if (!text) return colors[0];
    const idx = text.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  formatDate(value: string): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return value;
    }
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.condition ? action.condition(row) : true;
  }
}

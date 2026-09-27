import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopnavComponent } from '../topnav/topnav.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { AppToastComponent } from '../../shared/components/app-toast/app-toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopnavComponent, BreadcrumbComponent, AppToastComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  sidebarCollapsed = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('spms_sidebar');
      if (saved !== null) {
        this.sidebarCollapsed = saved === '1';
      }
    }
  }

  onSidebarCollapsedChange(val: boolean): void {
    this.sidebarCollapsed = val;
  }

  get mainMargin(): string {
    return this.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
  }
}

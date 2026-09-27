import { Component, Input, Output, EventEmitter, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input()  collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  navGroups: NavGroup[] = [
    {
      label: '',
      items: [
        { label: 'Dashboard',       icon: 'dashboard',    route: '/dashboard',          roles: [] }
      ]
    },
    {
      label: 'Admin Modules',
      items: [
        { label: 'Manage Roles',    icon: 'badge',        route: '/masters/roles',      roles: ['Admin'] },
        { label: 'Manage Users',    icon: 'group',        route: '/masters/users',      roles: ['Admin'] },
        { label: 'Students',        icon: 'school',       route: '/masters/students',   roles: ['Admin'] },
        { label: 'Faculty',         icon: 'person',       route: '/masters/faculty',    roles: ['Admin'] },
        { label: 'Status',            icon: 'tune',         route: '/masters/status',    roles: ['Admin'] },
        { label: 'Priority',          icon: 'flag',         route: '/masters/priority',  roles: ['Admin'] }
      ]
    },
    {
      label: 'Project Management',
      items: [
        { label: 'Projects',        icon: 'folder_open',  route: '/projects',           roles: [] },
        { label: 'Tasks',           icon: 'task_alt',     route: '/tasks',              roles: [] }
      ]
    }
  ];

  ngOnInit(): void {
    // Filter nav items based on role
  }

  getDashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }

  isVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasAnyRole(item.roles);
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('spms_sidebar', this.collapsed ? '1' : '0');
    }
  }
}

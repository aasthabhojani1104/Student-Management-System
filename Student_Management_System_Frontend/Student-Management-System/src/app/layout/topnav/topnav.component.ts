import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent {
  @Input()  sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService  = inject(AuthService);
  themeService = inject(ThemeService);

  dropdownOpen = false;

  get user() { return this.authService.currentUser(); }
  get isDark() { return this.themeService.isDark(); }

  getAvatarText(): string {
    const name = this.user?.fullName ?? '';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(): string {
    const name = this.user?.fullName ?? '';
    const colors = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#8b5cf6'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  }

  toggleDropdown(): void { this.dropdownOpen = !this.dropdownOpen; }
  closeDropdown(): void  { this.dropdownOpen = false; }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}

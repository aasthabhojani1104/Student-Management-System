import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  private router       = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs: Breadcrumb[] = [];

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.buildBreadcrumbs();
    });
  }

  private buildBreadcrumbs(): void {
    const crumbs: Breadcrumb[] = [{ label: 'Home', url: '/' }];
    let route: ActivatedRoute | null = this.activatedRoute.root;

    while (route) {
      const children: ActivatedRoute[] = route.children;
      let found = false;
      for (const child of children) {
        const data = child.snapshot.data;
        if (data?.['breadcrumb']) {
          crumbs.push({ label: data['breadcrumb'] as string, url: this.router.url });
          found = true;
        }
        route = child;
        break;
      }
      if (!found) break;
    }
    this.breadcrumbs = crumbs;
  }
}

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] ?? [];
  if (!requiredRoles.length) return true;

  if (auth.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Redirect to own dashboard
  return router.createUrlTree([auth.getDashboardRoute()]);
};

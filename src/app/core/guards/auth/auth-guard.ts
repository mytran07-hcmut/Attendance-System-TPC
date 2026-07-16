import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Bypass guard during SSR to prevent unwanted redirects to login
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  if (currentRole) {
    if (!expectedRole || expectedRole === 'employee' || currentRole === expectedRole) {
      return true;
    }
  }

  // Not authorized or wrong role
  router.navigate(['/login']);
  return false;
};

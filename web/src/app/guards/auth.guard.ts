import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import CONSTANTS from '../constants/constants';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const bearerToken = localStorage.getItem(CONSTANTS.USER_AUTH_TOKEN);
  if(!bearerToken) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};

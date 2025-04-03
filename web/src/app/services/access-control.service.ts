import { Injectable, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { ACCESS_CONTROL, Permission, Role } from '../../accessControl';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private readonly BACKEND_SERVER_DOMAIN = environment.API_GATEWAY;
  private userService = inject(UserService);
  private httpService = inject(HttpClient);
  private role$: Signal<Role | undefined> = signal(undefined);

  constructor() {
    this.role$ = computed(() => {
      const userProfile$ = this.userService.getUserProfile$();
      return userProfile$()?.organisationRole as Role;
    });
  }

  public hasPermission(permission: Permission): boolean {
    const role = this.getUserRole() as Role;
    if (!role || !ACCESS_CONTROL[role])
      return false;

    return ACCESS_CONTROL[role].includes(permission);
  }

  public hasPermissions(permissions: Permission[]) {
    for (const permission of permissions) {
      if (!this.hasPermission(permission))
        return false;
    }

    return true;
  }

  public getUserRole() {
    return this.role$();
  }

  public updateUserPrivileges(userId: string, payload: { organisationRole: string }) {
    return this.httpService.put(this.BACKEND_SERVER_DOMAIN+'/organisation/user/'+userId+"/privilege", payload);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import CONSTANTS from '../constants/constants';
import { Router } from '@angular/router';
import { shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private readonly BACKEND_SERVER_DOMAIN = environment.API_GATEWAY;
  private http: any = inject(HttpClient);

  constructor() { }

  login(payload: any): any {
    const req = this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/login", payload).pipe(shareReplay());
    req.subscribe({
      next: (res: any) => {
        const bearerToken = res.UserAuthToken.split(" ")[1];
        localStorage.setItem('UserAuthToken', bearerToken);
      }
    });

    return req;
  }

  public loginWithGoogle(payload: any): any {
    const req = this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/login-google", payload).pipe(shareReplay());
    req.subscribe({
      next: (res: any) => {
        const bearerToken = res.UserAuthToken.split(" ")[1];
        localStorage.setItem('UserAuthToken', bearerToken);
      }
    });

    return req;
  }

  registerWithEmailAndPassword(payload: any): any {
    return this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/register", payload);
  }

  registerWithInvitation(invitationId: string, payload: { password: string }): any {
    return this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/register/" + invitationId, payload);
  }

  public registerWithGoogle(payload: any): any {
    return this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/register-google", payload);
  }

  logout(): any {
    localStorage.removeItem(CONSTANTS.USER_AUTH_TOKEN);
    this.router.navigate(["/auth/login"]);
  }

  forgotPassword(payload: any): any {
    return this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/forgot-password", payload);
  }

  resetPassword(id: string, payload: any): any {
    return this.http.post(this.BACKEND_SERVER_DOMAIN + "/userAuth/reset-password/" + id, payload);
  }
}

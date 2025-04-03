import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserProfile } from '../modals/user.modal';
import { share, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BACKEND_SERVER_DOMAIN: String = environment.API_GATEWAY;
  private http: any = inject(HttpClient);

  private userProfile$: WritableSignal<UserProfile | undefined> = signal(undefined);

  constructor() {
    this.loadUserProfile();
  }

  public loadUserProfile() {
    const request$ = this.http.get(this.BACKEND_SERVER_DOMAIN+"/user/profile").pipe(share());
    request$.subscribe({
      next: (data: any)=> {
        this.userProfile$.set({
          userId: data.user._id,
          name: data.user.name,
          organisationId: data.user.organisationId,
          organisationRole: data.user.organisationRole,
          email: data.user.email,
          gender: data.user.gender,
          role: data.user.role,
          profile: data.user.profile
        });
      },
      error: (err: any)=> {
        console.log(err);
      }
    });

    return request$;
  }

  public getUserProfile() {
    return this.userProfile$();
  }

  public fetchUserProfile(userId: string) {
    return this.http.get(this.BACKEND_SERVER_DOMAIN+"/user/"+userId);
  }

  public getUserProfile$() {
    return this.userProfile$.asReadonly();
  }

  public updateProfile(payload: any) {
    return this.http.put(this.BACKEND_SERVER_DOMAIN+"/user/profile",payload);
  }

  public uploadProfilePicture(payload: any): any {
    return this.http.patch(this.BACKEND_SERVER_DOMAIN+"/user/profile/profile-picture",payload);
  }
}
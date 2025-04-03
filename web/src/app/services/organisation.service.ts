import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs';
import { Organisation } from '../modals/organisation.model';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private readonly BACKEND_SERVER_DOMAIN: String = environment.API_GATEWAY;
  private http = inject(HttpClient);
  
  private userOrganisation$: WritableSignal<Organisation | undefined> = signal(undefined);

  constructor() {
    this.loadUserOrganisation();
  }

  public loadUserOrganisation() {
    const request$ = this.http.get(this.BACKEND_SERVER_DOMAIN + "/user/organisation").pipe(share());
    request$.subscribe({
      next: (data: any) => {
        this.userOrganisation$.set({
          organisationId: data.organisation.organisationId,
          name: data.organisation.name,
          picture: data.organisation.picture
        });
      },
      error: (err: any) => { console.log(err); }
    });

    return request$;
  }

  public uploadOrganisationPicture(payload: any): any {
    const request = this.http.patch(this.BACKEND_SERVER_DOMAIN+"/organisation/organisation-picture",payload).pipe(share());
    request.subscribe({
      next: ()=> { this.loadUserOrganisation(); }
    });

    return request;
  }

  public getUserOrganisation() {
    return this.userOrganisation$();
  }

  public getOrganisationPeople() {
    return this.http.get(this.BACKEND_SERVER_DOMAIN+"/organisation/people");
  }

  public removeUserFromOrganisation(userId: string) {
    return this.http.delete(this.BACKEND_SERVER_DOMAIN+"/organisation/user/"+userId);
  }
}

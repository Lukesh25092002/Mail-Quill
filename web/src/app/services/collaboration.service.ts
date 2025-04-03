import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { share } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private readonly BACKEND_SERVER_DOMAIN: String = environment.API_GATEWAY;
  private http = inject(HttpClient);

  private pendingInvitations: WritableSignal<any[]> = signal([]);

  constructor() {
    this.sync();
  }

  sync(): void {
    this.http.get(this.BACKEND_SERVER_DOMAIN+"/organisation/collaboration").subscribe({
      next: (data: any) => {
        this.pendingInvitations.set(data.invitations);
        console.log(this.pendingInvitations());
      }
    });
  }

  fetchOrganisationInvitationDetails(invitationId: string) {
    const request = this.http.get(this.BACKEND_SERVER_DOMAIN+"/collaboration/"+invitationId).pipe(share());
    request.subscribe({
      next: (res) => {
        console.log(res);
      }
    });

    return request;
  }

  sendOrganisationInvitation(payload: any) {
    const request$ = this.http.post(this.BACKEND_SERVER_DOMAIN+"/collaboration/organisation",payload).pipe(share());
    request$.subscribe({
      complete: () => { this.sync(); }
    });

    return request$;
  }

  deleteOrganicationInvitation(invitationId: string) {
    const request$ = this.http.delete(this.BACKEND_SERVER_DOMAIN+"/collaboration/organisation/"+invitationId);
    request$.subscribe({
      complete: () => { this.sync(); }
    });

    return request$;
  }

  public getPendingInvitations() {
    return this.pendingInvitations();
  }
}

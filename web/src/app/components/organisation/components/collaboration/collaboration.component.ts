import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit, ViewContainerRef, WritableSignal, inject, signal } from '@angular/core';
import { OrganisationService } from '../../../../services/organisation.service';
import { LoadingAnimationComponent } from '../../../../shared/reusableComponents/loading-animation/loading-animation.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { P } from '@angular/cdk/keycodes';
import { Role, Permission } from '../../../../../accessControl';
import { UserService } from '../../../../services/user.service';
import { CollaborationService } from '../../../../services/collaboration.service';
import { ConfirmationModalService } from '../../../../services/confirmation-modal.service';
import { AccessControlService } from '../../../../services/access-control.service';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,LoadingAnimationComponent],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.css'
})
export class CollaborationComponent implements OnInit{
  public Object = Object;
  public readonly ROLE = Role;
  public isLoading: boolean = false;
  private userProfile = inject(UserService);
  private organisationService = inject(OrganisationService);
  public collaborationService = inject(CollaborationService);
  public confirmationModalService = inject(ConfirmationModalService);
  public accessControlService = inject(AccessControlService);
  public readonly PERMISSION = Permission;

  private viewContainerRef = inject(ViewContainerRef);
  private injector = inject(Injector);


  public organisationInvitationForm = new FormGroup({
    email: new FormControl('',[Validators.required,Validators.email ]),
    organisationRole: new FormControl('',[Validators.required]),
  });


  ngOnInit(): void {
    this.confirmationModalService.configure(this.viewContainerRef,this.injector);
  }

  inviteToOrganisation() {
    const payload = {
      email: this.organisationInvitationForm.get("email")?.value,
      organisationRole: this.organisationInvitationForm.get("organisationRole")?.value,
    }
    
    this.isLoading = true;
    this.organisationInvitationForm.disable;
    this.collaborationService.sendOrganisationInvitation(payload).subscribe({
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        setTimeout(()=> {
          this.organisationInvitationForm.reset();
          this.organisationInvitationForm.enable;
          this.isLoading = false;
        },2000);
      }
    });
  }

  async deleteInvitation(invitationId: any) {
    const apporval: boolean = await this.confirmationModalService.generateConfirmationModal("The items will be deleted permanently");
    if(!apporval)
      return ;

    this.isLoading = true;
    this.collaborationService.deleteOrganicationInvitation(invitationId).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      complete: () => {
        setTimeout(()=> {
          this.isLoading = false;
        },2000);
      }
    });
  }
}

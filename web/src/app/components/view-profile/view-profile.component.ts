import { Component, Injector, ViewContainerRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { LoadingAnimationComponent } from '../../shared/reusableComponents/loading-animation/loading-animation.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../modals/user.modal';
import { OrganisationService } from '../../services/organisation.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { Role, Permission } from '../../../accessControl';
import { AccessControlService } from '../../services/access-control.service';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [LoadingAnimationComponent, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.css'
})
export class ViewProfileComponent {
  public Object = Object;
  public readonly ROLE = Role;
  public readonly PERMISSION = Permission;
  public authService = inject(AuthService);
  public userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private organisationService = inject(OrganisationService);
  public isLoading: boolean = false;
  public userId: any;
  private confirmationModalService = inject(ConfirmationModalService);
  public accessControlService = inject(AccessControlService);
  private viewContainerRef = inject(ViewContainerRef);
  private injector = inject(Injector);

  public profile: UserProfile | undefined;

  public profileForm = new FormGroup({
    organisationRole: new FormControl()
  });

  ngOnInit(): void {
    this.confirmationModalService.configure(this.viewContainerRef,this.injector);

    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      this.userService.fetchUserProfile(this.userId).subscribe({
        next: (data: any) => {
          console.log(data.user);
          this.profile = data.user as UserProfile;
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {          
          if(this.profile?.userId==this.userService.getUserProfile()?.userId)
            this.router.navigate(['/user/profile']);
        }
      });
    }); 
  }

  public async removeUserFromOrganisation() {
    const approval = await this.confirmationModalService.generateConfirmationModal("All instances associated with the user will be deleted permanently");
    if(!approval)
      return ;

    this.organisationService.removeUserFromOrganisation(this.userId).subscribe({
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.router.navigate(['/user/organisation']);
      }
    });
  }

  public resetUserOrganisationRole() {
    this.profileForm.patchValue({ organisationRole: this.profile?.organisationRole });
    this.profileForm.markAsPristine();
  }

  public updateUserPrivileges() {
    const organisationRole = this.profileForm.get("organisationRole")?.value;
    const payload = { organisationRole };
    
    this.isLoading = true;
    this.accessControlService.updateUserPrivileges(this.profile?.userId!,payload).subscribe({
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.profileForm.markAsPristine();
        }, 1500);
      }
    });
  }
}

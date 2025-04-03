import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingAnimationComponent } from '../../shared/reusableComponents/loading-animation/loading-animation.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { OrganisationService } from '../../services/organisation.service';
import { AccessControlService } from '../../services/access-control.service';
import { Role, Permission } from '../../../accessControl';

import { PeopleComponent } from './components/people/people.component';
import { ChatsComponent } from './components/chats/chats.component';
import { CollaborationComponent } from './components/collaboration/collaboration.component';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingAnimationComponent,PeopleComponent, ChatsComponent, CollaborationComponent],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.css'
})
export class OrganisationComponent {
  public readonly Role = Role;
  public readonly Permission = Permission;

  public adminPanelIndex: number = 0;

  public authService = inject(AuthService);
  public userService = inject(UserService);
  public organisationService = inject(OrganisationService);
  public accessControlService = inject(AccessControlService);
  public isLoading: boolean = false;
  public organisationPictureURL: string | undefined;
  public selectedFile?: File = undefined;

  ngOnInit(): void {
    this.organisationService.loadUserOrganisation().subscribe({
      next: (data: any) => { this.organisationPictureURL = data.organisation.picture },
      error: (err: any) => { console.log(err); }
    });
  }

  public resetForm(): void {
    this.selectedFile = undefined;
    this.organisationPictureURL = this.organisationService.getUserOrganisation()?.picture;
  }

  public uploadOrganisationPicture(): any {
    if (!this.selectedFile) {
      this.resetForm();
      return;
    }
    
    this.isLoading = true;
    const formData = new FormData();
    formData.append('organisation-picture', this.selectedFile);

    this.organisationService.uploadOrganisationPicture(formData).subscribe({
      error: (err: any)=> { this.resetForm(); },
      complete: ()=> {
        this.selectedFile = undefined;
        setTimeout(()=>{ this.isLoading = false; }, 2000);
      }
    });
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.organisationPictureURL = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // 
}

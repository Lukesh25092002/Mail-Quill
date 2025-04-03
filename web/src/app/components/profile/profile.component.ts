import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingAnimationComponent } from '../../shared/reusableComponents/loading-animation/loading-animation.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,RouterLink, ReactiveFormsModule,LoadingAnimationComponent, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  public authService = inject(AuthService);
  public userService = inject(UserService);
  public isLoading: boolean = false;
  public profilePictureURL = '';
  public selectedFile?: File;
  public profileForm: FormGroup = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    userID: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
  });

  public timepass(): void {
    console.log("Button clicked");
  }

  ngOnInit(): void {
    this.userService.loadUserProfile().subscribe({
      next: (data: any)=> {
        this.profilePictureURL = data.user.profile;
        this.profileForm.patchValue({
          firstname: data.user?.name?.split(' ')[0],
          lastname: data.user?.name?.split(' ')[1] || '',
          userID: data.user._id,
          email: data.user.email,
          role: data.user.role,
          gender: data.user.gender
        });
      },
      error: (err: any)=> {
        console.log(err);
      }
    });
  }

  public resetForm(): void {
    const user = this.userService.getUserProfile();
    this.profilePictureURL = user?.profile || "";
    this.profileForm.patchValue({
      firstname: user?.name?.split(' ')[0],
      lastname: user?.name?.split(' ')[1] || '',
      userID: user?.userId,
      email: user?.email,
      role: user?.role,
      gender: user?.gender
    });
    this.profileForm.markAsPristine();
  }

  updateProfile(): void {
    const payload = {
      name: this.profileForm.get("firstname")?.value + " " + this.profileForm.get("lastname")?.value,
      role: this.profileForm.get("role")?.value,
      gender: this.profileForm.get("gender")?.value
    };

    this.isLoading = true;
    this.userService.updateProfile(payload).subscribe({
      next: ()=> { },
      error: (err: any)=> {
        console.log(err);
        setTimeout(()=> { this.isLoading=false },2000);
      },
      complete: ()=> {
        this.profileForm.markAsPristine();
        setTimeout(()=> { this.isLoading=false },2000);
      }
    });

    if(this.selectedFile) {
      console.log("uppa");
      const formData = new FormData();
      formData.append('avatar', this.selectedFile);

      this.userService.uploadProfilePicture(formData).subscribe({
        next: (response: any) => console.log('Upload successful', response),
        error: (error: any) => console.error('Upload failed', error),
      });
    }
  }

  public onFileChange(event: Event): void {
    this.profileForm.markAsDirty();
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.profilePictureURL = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }
}
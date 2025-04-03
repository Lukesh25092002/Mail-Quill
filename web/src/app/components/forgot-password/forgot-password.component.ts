import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingAnimationComponent } from '../../shared/reusableComponents/loading-animation/loading-animation.component';
import { CommonModule } from '@angular/common';
import { CompletionTriggerKind } from 'typescript';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  public isForgotPasswordActive: boolean = true;
  public isLoading: boolean = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('',[Validators.required,Validators.email])
  });

  forgotPassword(): void {
    this.isLoading = true;
    const payload = {
      email: this.forgotPasswordForm.get("email")?.value
    };
    console.log(payload);

    this.authService.forgotPassword(payload).subscribe({
      next: (data: any)=> {
        // Nothing to do
      },
      error: (err: any)=> {
        console.log(err);
        setTimeout(() => {
          this.isLoading = false;
          this.forgotPasswordForm.reset();
        }, 2000);
      },
      complete: ()=> {
        setTimeout(()=>{
          this.isLoading = false;
          this.isForgotPasswordActive = false;
        },2000
      );
      }
    });
  }
}
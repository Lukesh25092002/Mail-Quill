import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LoadingAnimationComponent } from '../../shared/reusableComponents/loading-animation/loading-animation.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink,LoadingAnimationComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  public isForgotPasswordActive: boolean = true;
  public isLoading: boolean = false;
  private sessionId: string | null = "";
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetPasswordForm = new FormGroup({
    password: new FormControl('',[Validators.required]),
    password2: new FormControl('',[Validators.required])
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('id');
      console.log(this.sessionId);
    });
  }

  resetPassword(): void {
    if(this.resetPasswordForm.get("password")?.value != this.resetPasswordForm.get("password")?.value)
      return ;

    this.isLoading = true;
    const payload = {
      password: this.resetPasswordForm.get("password")?.value
    };
    console.log(payload);

    this.authService.resetPassword(this.sessionId || "garbage",payload).subscribe({
      next: (data: any)=> {
        // Nothing to do
      },
      error: (err: any)=> {
        console.log(err);
        setTimeout(() => {
          this.isLoading = false;
          this.resetPasswordForm.reset();
        }, 2000);
      },
      complete: ()=> {
        setTimeout(()=>{
          this.isLoading = false;
          this.isForgotPasswordActive = false;
        },2000);
      }
    });
  }
}

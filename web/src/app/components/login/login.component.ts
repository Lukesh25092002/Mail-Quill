import { CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EmailComponent } from '../home/components/chat/components/email/email.component';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { LoadingAnimationComponent } from "../../shared/reusableComponents/loading-animation/loading-animation.component";
import { CollaborationService } from '../../services/collaboration.service';
import { _closeDialogVia } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingAnimationComponent, RouterModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  isLoginPanelActive: boolean = false;
  isLoading: boolean = false;
  public invited: boolean = true;
  public invitationDetails: any;
  authService = inject(AuthService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private colloborationService = inject(CollaborationService);

  public readonly GOOGLE_AUTH_ACTION = { DEFAULT: "default", LOGIN: "login", REGISTER: "register" };
  public googleAuthAction = this.GOOGLE_AUTH_ACTION.LOGIN;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    organisation: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    password2: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    (window as any).handelGoogleAuth = this.handelGoogleAuth.bind(this);

    this.route.queryParams.subscribe(params => {
      const invitationId = params['invitationId'];
      if(invitationId){
        this.colloborationService.fetchOrganisationInvitationDetails(invitationId).subscribe({
          next: (data: any)=> { this.invitationDetails = data.invitationDetails; console.log(this.invitationDetails); },
          error: (err)=> { this.invitationDetails = undefined; }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // this.renderGoogleButtons();
  }

  togglePanel(isLogin: boolean): void {
    this.isLoginPanelActive = isLogin;
    if (this.isLoginPanelActive)
      this.googleAuthAction = this.GOOGLE_AUTH_ACTION.LOGIN;
    else
      this.googleAuthAction = this.GOOGLE_AUTH_ACTION.REGISTER;
  }

  loginWithEmailAndPassword(): void {
    this.isLoading = true;
    const payload = {
      email: this.loginForm.get("email")?.value,
      password: this.loginForm.get("password")?.value
    }
    console.log(payload);

    this.authService.login(payload).subscribe(
      {
        next: (response: any) => { },
        error: (err: any) => {
          console.log(err);
          setTimeout(() => {
            this.isLoading = false;
            this.loginForm.reset();
          }, 1000);
        },
        complete: () => {
          this.loginForm.reset();
          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/']);
          }, 1000);
        }
      }
    );
  }

  registerWithInvitation() {
    if (this.registerForm.get("password")?.value != this.registerForm.get("password2")?.value)
      return;

    const invitationId = this.invitationDetails.invitationId;
    const payload = { password: this.registerForm.get("password")?.value as string };

    this.isLoading = true;
    this.authService.registerWithInvitation(invitationId,payload).subscribe({
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.registerForm.reset();
        this.loginForm.get('email')?.setValue(this.invitationDetails.email);
        this.loginForm.get('password')?.setValue(payload.password);
        setTimeout(()=> {
          this.isLoading = false;
          this.isLoginPanelActive = true;
          this.loginWithEmailAndPassword();
        },2000);
      }
    });
  }

  registerWithEmailAndPassword(): void {
    if (this.registerForm.get("password")?.value != this.registerForm.get("password2")?.value)
      return;

    const payload = {
      email: this.registerForm.get("email")!.value,
      organisationName: this.registerForm.get("organisation")!.value,
      password: this.registerForm.get("password")!.value,
    }
    console.log(payload);

    this.isLoading = true;
    this.authService.registerWithEmailAndPassword(payload).subscribe({
      next: (response: any) => {
        // Nothing to do
      },
      error: (err: any) => {
        console.log(err);
        setTimeout(() => {
          this.isLoading = false;
          this.loginForm.reset();
        }, 1000);
      },
      complete: () => {
        this.isLoading = false;
        this.loginForm.get('email')?.setValue(payload.email);
        this.loginForm.get('password')?.setValue(payload.password);
        this.loginWithEmailAndPassword();
      }
    });

    this.registerForm.reset();
  }

  handelGoogleAuth(credentialResponse: any) {
    if (this.googleAuthAction == this.GOOGLE_AUTH_ACTION.LOGIN)
      this.loginWithGoogle(credentialResponse);
    else if (this.googleAuthAction == this.GOOGLE_AUTH_ACTION.REGISTER)
      this.registerWithGoogle(credentialResponse);
    else
      throw new Error("Invalid googleAuthAction");
  }

  private loginWithGoogle(credentialResponse: any) {
    const credential = credentialResponse.credential;
    this.authService.loginWithGoogle({ credential }).subscribe({
      next: (res: any) => { console.log(res); },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    });
  }

  private registerWithGoogle(credentialResponse: any) {
    const credential = credentialResponse.credential;
    this.authService.registerWithGoogle({ credential }).subscribe({
      next: (res: any) => { console.log(res); },
      error: (err: any) => { console.log(err); },
      complete: () => {
        this.authService.loginWithGoogle(credentialResponse).subscribe({
          next: () => { },
          error: (err: any) => { console.log(err); },
          complete: () => { this.router.navigate(['/user/profile']); }
        });
      }
    });
  }
}
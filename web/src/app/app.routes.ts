import { Routes } from '@angular/router';
import { ChatComponent } from './components/home/components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { DefaultComponent } from './components/home/components/default/default.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { ViewProfileComponent } from './components/view-profile/view-profile.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: DefaultComponent,  // Default component within Home
                pathMatch: 'full' // Ensures this path matches exactly
            },
            {
                path: 'chats/:id', // Specific chat route with dynamic id
                component: ChatComponent
            }
        ]
    },
    {
        path: "auth/login",
        component: LoginComponent,
        pathMatch: "full"
    },
    {
        path: "auth/forgot-password",
        component: ForgotPasswordComponent,
        pathMatch: "full"
    },
    {
        path: "auth/reset-password/:id",
        component: ResetPasswordComponent,
        pathMatch: "full"
    },
    {
        path: "user/profile",
        canActivate: [authGuard],
        component: ProfileComponent,
        pathMatch: "full"
    },
    {
        path: "user/organisation",
        canActivate: [authGuard],
        component: OrganisationComponent,
        pathMatch: "full"
    },
    {
        path: "user/settings",
        canActivate: [authGuard],
        component: SettingsComponent,
        pathMatch: "full"
    },
    {
        path: "user/:id",
        canActivate: [authGuard],
        component: ViewProfileComponent,
        pathMatch: "full"
    }
];
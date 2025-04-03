import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatComponent } from "./components/chat/chat.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, RouterLink ,RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isFullScreen: boolean = false;
  isChatOpen: boolean = true
  @ViewChild('sidebar') sidebar?: any;
  authService = inject(AuthService);
  public userService = inject(UserService);

  logout(): void {
    this.authService.logout();
  }

  toggleFullScreen(): void {
    console.log('Clicked on toggle');
    this.isFullScreen = !this.isFullScreen;
    
    if(this.isFullScreen){
      this.sidebar.aside.nativeElement.style.zIndex = -999;
    }
    else{
      setTimeout(()=>{
        this.sidebar.aside.nativeElement.style.zIndex = 999;
      },500);
    }
  }
}

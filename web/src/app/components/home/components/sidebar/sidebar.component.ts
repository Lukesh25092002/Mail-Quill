import { Injector, OnInit, ViewContainerRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Component,ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { ConfirmationModalService } from '../../../../services/confirmation-modal.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingAnimationComponent } from '../../../../shared/reusableComponents/loading-animation/loading-animation.component';
import { ChatService } from '../../../../services/chat.service';
import { CreateChatComponent } from '../create-chat/create-chat.component';
import { AccessControlService } from '../../../../services/access-control.service';
import { Role, Permission } from '../../../../../accessControl';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink,CreateChatComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  injector = inject(Injector);
  viewContainerRef = inject(ViewContainerRef);
  public chatService = inject(ChatService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  confirmationModalService = inject(ConfirmationModalService);
  public accessControlService = inject(AccessControlService);

  public readonly PERMISSION = Permission;

  isCreateChatModal: boolean = false;
  isCreateChatModalLoading: boolean = false;
  isFullscreen: boolean = false;

  createChatForm: FormGroup = new FormGroup({
    organisation: new FormControl("",[Validators.required]),
    link: new FormControl("",[Validators.required])
  });
  currentChatId:string='';
  // history: any[] = [];
  
  @ViewChild('aside') aside?: ElementRef;

  constructor(public elementRef: ElementRef) {    // Exposes nativeElement
    
  }

  ngOnInit() {
    this.confirmationModalService.configure(this.viewContainerRef,this.injector);

    // this.chatService.getChatId$().subscribe({
    //   // 
    // });
  }

  async deleteChat(chatId: string): Promise<void> {
    const apporval: boolean = await this.confirmationModalService.generateConfirmationModal("The items will be deleted permanently");
    if(!apporval)
      return ;
    
    this.chatService.deleteChat(chatId).subscribe({
      next: ()=> {
        if (chatId==this.chatService.getChatId())
          this.router.navigate(['/']);
      }
    });
  }

  setCreateChatVisibility(visibility: boolean): void {
    if(!visibility)
      this.createChatForm.reset();

    this.isCreateChatModal = visibility;
  }

  createChat(): void {
    this.isCreateChatModalLoading = true;

    const payload = {
      client: this.createChatForm.get("client")?.value,
      link: this.createChatForm.get("link")?.value
    }

    this.chatService.createNewChat(payload).subscribe(
      {
        next: (res: any)=>{
          console.log(res);
          const chatId = res.chat._id;
          setTimeout(()=>{this.router.navigate(['/chats', chatId]);},2000);
        },
        error: (err: any)=>{
          console.log(err);
          setTimeout(()=>{this.isCreateChatModalLoading=false;this.createChatForm.reset()},1000);
        },
        complete: ()=> {
          setTimeout(()=>{
            this.setCreateChatVisibility(false);
            this.isCreateChatModalLoading = false;
            this.createChatForm.reset();
          },1000);
        }
      }
    );
  }

}
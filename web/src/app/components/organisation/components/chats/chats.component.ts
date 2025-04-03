import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit, ViewContainerRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../../../services/chat.service';
import { AccessControlService } from '../../../../services/access-control.service';
import { Permission } from '../../../../../accessControl';
import { ConfirmationModalService } from '../../../../services/confirmation-modal.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent implements OnInit{
  public PERMISSION = Permission;
  public accessControlService = inject(AccessControlService);
  public chatService = inject(ChatService);
  private confirmationModalService = inject(ConfirmationModalService);
  private injector = inject(Injector);
  private viewContainerRef = inject(ViewContainerRef);
  public chats: any;

  ngOnInit(): void {
    this.confirmationModalService.configure(this.viewContainerRef,this.injector);
  }

  async deleteChat(chatId: string): Promise<void> {
    const apporval: boolean = await this.confirmationModalService.generateConfirmationModal("The items will be deleted permanently");
    if(!apporval)
      return ;
    
    this.chatService.deleteChat(chatId).subscribe();
  }
}

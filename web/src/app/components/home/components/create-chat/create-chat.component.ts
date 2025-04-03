import { Component, EventEmitter, Output, inject } from '@angular/core';
import { LoadingAnimationComponent } from '../../../../shared/reusableComponents/loading-animation/loading-animation.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../../../services/chat.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-chat',
  standalone: true,
  imports: [CommonModule,LoadingAnimationComponent, ReactiveFormsModule],
  templateUrl: './create-chat.component.html',
  styleUrl: './create-chat.component.css'
})
export class CreateChatComponent {
  private chatService = inject(ChatService);
  private router = inject(Router);

  @Output() onCancel = new EventEmitter<any>();
  public isCreateChatModalLoading: boolean = false;

  public createChatForm: FormGroup = new FormGroup({
    client: new FormControl("", [Validators.required]),
    link: new FormControl("", [Validators.required])
  });

  public createChat(): void {
    this.isCreateChatModalLoading = true;

    const payload = {
      client: this.createChatForm.get("client")?.value,
      link: this.createChatForm.get("link")?.value
    }

    this.chatService.createNewChat(payload).subscribe(
      {
        next: (res: any) => {
          console.log(res);
          const chatId = res.chat._id;
          setTimeout(() => { this.router.navigate(['/chats', chatId]); }, 2000);
        },
        error: (err: any) => {
          console.log(err);
          setTimeout(() => { this.isCreateChatModalLoading = false; this.createChatForm.reset() }, 1000);
        },
        complete: () => {
          setTimeout(() => {
            this.isCreateChatModalLoading = false;
            this.createChatForm.reset();
            this.onCancel.emit();
          }, 1000);
        }
      }
    );
  }
}

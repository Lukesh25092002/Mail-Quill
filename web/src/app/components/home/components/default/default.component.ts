import { Component } from '@angular/core';
import { CreateChatComponent } from "../create-chat/create-chat.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule,CreateChatComponent],
  templateUrl: './default.component.html',
  styleUrl: './default.component.css'
})
export class DefaultComponent {
  public isCreateChatActive = false;

  public setCreateChatVisibility(visibility: boolean) {
    console.log("This is a dummy");
    this.isCreateChatActive = visibility;
  }
}

import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild, effect, inject, runInInjectionContext } from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import { EmailComponent } from './components/email/email.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { ChatService } from '../../../../services/chat.service';
import { BehaviorSubject } from 'rxjs';

enum MESSAGE_TYPE {
  HUMAN_MESSAGE = 'HumanMessage',
  AI_MESSAGE = 'AIMessage',
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,MatTooltipModule,EmailComponent,ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{
  MESSAGE_TYPE = MESSAGE_TYPE;
  chatService = inject(ChatService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private injector = inject(Injector);
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  chatMessages: any[] = [];

  chatForm:FormGroup = new FormGroup({
    message: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.loadChatData(this.chatService.getChatId());
      });
    });
  }

  loadChatData(chatId: String | null): void {
    if(!chatId)
      return ;
    
    this.chatService.getChatById(chatId)
    .subscribe({
      next: (response: any)=>{
        this.chatMessages = response.chat.history;
      },
      error: (err: Error)=>{
        this.loadDummyChats();
        // this.router.navigate(['/']);
      },
      complete: ()=>{
        this.scrollToBottom();
      }
    });
  }

  // Only for development purpose
  private loadDummyChats(): void {
    this.chatMessages = [
      {
        type: "HumanMessage",
        query: "Can you tell me about the weather?"
      },
      {
        type: "AIMessage",
        email: {
          subject: "Weather Update",
          body: "The current weather is sunny with a temperature of 25°C. There is no rain forecast for the day, and the skies will remain clear. Winds are expected to be light, with speeds around 10 km/h. The evening may bring slightly cooler temperatures around 18°C. It’s a great day to plan outdoor activities or enjoy a walk in the park. Remember to stay hydrated if you’re out in the sun, and don’t forget sunscreen if you’ll be spending extended time outdoors."
        }
      },
      {
        type: "HumanMessage",
        query: "What is the capital of France?"
      },
      {
        type: "AIMessage",
        email: {
          subject: "Geography Information",
          body: "Paris is the capital city of France, located in the northern part of the country. It is renowned for its rich history, iconic landmarks, and vibrant culture. The Eiffel Tower, the Louvre Museum, and Notre Dame Cathedral are just a few highlights. Paris is also famous for its cuisine, including croissants, baguettes, and fine wine. The city is a hub for art, fashion, and education, attracting millions of visitors every year. It is situated along the Seine River and has been a center of European culture for centuries."
        }
      },
      {
        type: "unknown"
      },
      {
        type: "HumanMessage",
        query: "How do I cook pasta?"
      },
      {
        type: "AIMessage",
        email: {
          subject: "Cooking Tips",
          body: "To cook pasta perfectly, start by bringing a large pot of water to a rolling boil. Add a generous pinch of salt to enhance flavor. Once boiling, add the pasta and stir to prevent sticking. Cook according to the package instructions, usually around 8–12 minutes, until the pasta is al dente. Drain the pasta but reserve a cup of the cooking water. Toss the pasta with your favorite sauce, using the reserved water to adjust the consistency if needed. Serve hot, garnished with fresh herbs or grated cheese for extra flavor."
        }
      },
      {
        type: "unknown"
      }
    ];
  }

  private scrollToBottom(delay: number = 100): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTo({
          top: this.chatContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, delay);
  }
  
  
  
  
  

  onQuerySubmit(){
    const userMessage = this.chatForm.get('message')?.value;
    const payload: any = {userMessage};

    console.log(this.chatService.getChatId());
    console.log(payload);

    let responseEmail: any = null;

    this.chatService.messageChat(this.chatService.getChatId() as string,payload)
    .subscribe({
      next: (response: any)=>{
        responseEmail = response.email;
      },
      error: (err: Error)=>{
        console.log(err);
        this.chatMessages.push({type: "Error",});
      },
      complete: ()=>{
        // chatId = this.chatService.getCurrentChatId();
        this.chatMessages.push({type: MESSAGE_TYPE.HUMAN_MESSAGE, query: userMessage},{type: MESSAGE_TYPE.AI_MESSAGE, email: responseEmail});
        this.scrollToBottom();
        this.chatForm.reset();
      }
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { share, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly BACKEND_SERVER_DOMAIN = environment.API_GATEWAY;
  private http = inject(HttpClient);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private chatHistory = signal<{link: string, client: string, _id: string}[]>([]);
  private chatId$ = signal<String>("garbage");

  constructor() {
    this.sync();

    this.router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        // Traverse to the correct child route to get the 'id' parameter
        let childRoute = this.activatedRoute;
        while (childRoute.firstChild) {
          childRoute = childRoute.firstChild;
        }
  
        // For dynamic updates
        childRoute.paramMap.subscribe((params) => {
          this.chatId$.set(params.get('id') || 'garbage');
        });
  
        // For page reloads (snapshot)
        const chatIdSnapshot = childRoute.snapshot.paramMap.get('id') || 'garbage';
        this.chatId$.set(chatIdSnapshot);
      }
    });
  }

  public getChatId() {
    return this.chatId$();
  }

  public getChatId$() {
    return this.chatId$;
  }

  public sync(): void{
    this.getAllChats().subscribe({
      next: (res: any)=> {
        this.chatHistory.set(res);
        console.log(res);
      }
    });
  }

  createNewChat(payload: {link: string, client: string}): any {
    const req = this.http.post(this.BACKEND_SERVER_DOMAIN+"/chats",payload).pipe(shareReplay(1));
    req.subscribe({
      complete: () => {
        this.sync();
      }
    });

    return req;
  }

  public getChatHistory(): any {
    return this.chatHistory();
  }

  public getAllChats() {
    return this.http.get(this.BACKEND_SERVER_DOMAIN+"/chats");
  }

  public getChatById(chatId: String): any {
    return this.http.get(this.BACKEND_SERVER_DOMAIN+"/chats/"+chatId);
  }

  messageChat(chatId: string,payload: any) {
    return this.http.patch(this.BACKEND_SERVER_DOMAIN+"/chats/"+chatId,payload);
  }

  deleteChat(chatId: string) {
    const req = this.http.delete(this.BACKEND_SERVER_DOMAIN+"/chats/"+chatId).pipe(share());
    req.subscribe({
      complete: ()=> {
        this.chatHistory.update(chatHistory => { return chatHistory.filter(chat => chat._id!=chatId) });
      }
    });

    return req;
  }
}
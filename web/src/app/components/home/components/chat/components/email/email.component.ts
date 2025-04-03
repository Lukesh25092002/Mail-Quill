import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.css'
})
export class EmailComponent {
  @Input() email: any;
  isCopying: boolean = false;

  copyToClipboard(): void {
    this.isCopying = true;

    navigator.clipboard.writeText(this.email.subject+"\n"+this.email.body)
    .then(()=>{console.log("Content copied");})
    .catch((err)=>{console.log("Failed to copy")})
    .finally(()=>{setTimeout(()=>{this.isCopying=false;},2000);});
  }

  sendEmail(): void {
    const recipient = 'recipient@example.com';
    const subject = this.email.subject;
    const body = this.email.body;

    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  }
}
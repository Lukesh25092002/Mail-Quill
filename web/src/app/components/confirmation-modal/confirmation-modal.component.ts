import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent implements AfterViewInit{
  @Output() decision = new EventEmitter<boolean>();
  @Input() message = "Once action completed will not revert.";
  @ViewChild('confirmationBox') confirmationBox!: ElementRef;

  selectOption(decision: boolean) {
    this.decision.emit(decision);
  }

  ngAfterViewInit(): void {
    this.confirmationBox.nativeElement.style.scale = 1;
    this.confirmationBox.nativeElement.style.opacity = 1;
  }

  onOut(): void {
    
      this.confirmationBox.nativeElement.style.scale = 0.95;
      this.confirmationBox.nativeElement.style.opacity = 0.5;
  }

  ngAfterViewChecked(): void {
    
  }
}
import { ViewContainerRef,ComponentRef, Injectable, inject, ApplicationRef, ComponentFactoryResolver, Injector, ViewChild, Inject} from '@angular/core';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  private viewContainerRef!: ViewContainerRef;
  private injector!: Injector;

  constructor() { }

  configure(viewContainerRef: ViewContainerRef,injector: Injector): void{
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
  }

  generateConfirmationModal(message: string): Promise<boolean> {
    const confirmationPromise: Promise<boolean> = new Promise((resolve,reject)=>{
      const componentRef: ComponentRef<ConfirmationModalComponent> = this.viewContainerRef.createComponent(ConfirmationModalComponent, { injector: this.injector });
      componentRef.instance.message = message;
      componentRef.instance.decision.subscribe((decision) => {
        setTimeout(()=>{componentRef.destroy();},100);
        resolve(decision);
      },(err)=>{reject(false);});
    });

    return confirmationPromise;
  }
}
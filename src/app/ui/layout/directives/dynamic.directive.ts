import { Directive, ViewContainerRef } from "@angular/core";


@Directive({
    selector: '[appDynamic]',
    standalone: false
})  
  export class DynamicDirective {  
    constructor(public viewContainerRef: ViewContainerRef) { }  
  }
import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[hrefToRouterLink]'
})
export class HrefToRouterLinkDirective implements OnInit, OnDestroy {
  private _listeners: { destroy: () => void }[] = [];

  constructor(private _router: Router, private _el: ElementRef, private _renderer: Renderer2) { }

  ngOnInit() {
    setTimeout(() => {
    if (this._el.nativeElement.nodeName === 'A') {
      this.addRouterLink(this._el.nativeElement);
    } else {
      const links = this._el.nativeElement.querySelectorAll('a');
      links.forEach((linkHtmlElement: any) => this.addRouterLink(linkHtmlElement));
    }
    },0)
  }

  private addRouterLink(linkHtmlElement: any) {
    const href = linkHtmlElement?.getAttribute('href');
    if (href) {
        this._renderer.setAttribute(linkHtmlElement, 'routerLink', href);
        const destroyListener = this._renderer.listen(linkHtmlElement, 'click',
          (_event) => {
            _event.preventDefault();
            _event.stopPropagation();
            this._router.navigate([href]);
          });
        this._listeners.push({ destroy: destroyListener });
    }
  }

  ngOnDestroy(): void {
    this._listeners?.forEach(listener => listener.destroy());
    this._listeners = [];
  }

}

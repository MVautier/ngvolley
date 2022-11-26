import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}
    transform(value: string): string {
        return this.cleanHtmlValue(value);
    }

    private cleanHtmlValue(html: string): string {
        if (html.startsWith('SafeValue must use [property]=binding:')) {
          html = html.replace('SafeValue must use [property]=binding:', '');
        }
        if (html.endsWith('(see https://g.co/ng/security#xss)')) {
          html = html.replace('(see https://g.co/ng/security#xss)', '');
        }
        let value = this.sanitizer.bypassSecurityTrustHtml(html).toString();
        value = value.replace('SafeValue must use [property]=binding:', '')
          .replace('(see https://g.co/ng/security#xss)', '');
        
          value = this.sanitizer.bypassSecurityTrustResourceUrl(value).toString();
        value = value.replace('SafeValue must use [property]=binding:', '')
          .replace('(see https://g.co/ng/security#xss)', '');
        
        value = this.sanitizer.bypassSecurityTrustScript(value).toString();
        value = value.replace('SafeValue must use [property]=binding:', '')
          .replace('(see https://g.co/ng/security#xss)', '');

        value = this.sanitizer.bypassSecurityTrustStyle(value).toString();
        value = value.replace('SafeValue must use [property]=binding:', '')
          .replace('(see https://g.co/ng/security#xss)', '');

        value = this.sanitizer.bypassSecurityTrustUrl(value).toString();
        value = value.replace('SafeValue must use [property]=binding:', '')
          .replace('(see https://g.co/ng/security#xss)', '');
        return value;
    }
}
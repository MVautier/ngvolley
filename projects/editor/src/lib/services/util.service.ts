import {Injectable} from '@angular/core';


@Injectable()
export class UtilService {

  containers = ['p', 'td', 'div', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];
  headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'p', 'pre', 'div', 'default'];

  isDefined(value: any) {
    return value !== undefined && value !== null;
  }

  getParentContainer(node: HTMLElement): HTMLElement {
    while(!this.containers.includes(node.nodeName.toLowerCase()) && node.parentNode) {
      node = node.parentNode as HTMLElement;
    }
    return node;
  }

  getParentContainerForFont(node: HTMLElement): HTMLElement {
    const tags = this.containers.slice();
    tags.push('a', 'span');
    while(!tags.includes(node.nodeName.toLowerCase()) && node.parentNode) {
      node = node.parentNode as HTMLElement;
    }
    return node;
  }

  getStyleProperty(element: HTMLElement, property: string): string {
    if (element && element.style && element.style[property]) {
      return element.style[property];
    }
    return getComputedStyle(element)[property];
  }

  getUniqueId(baseId: string): string {
    return baseId + '-' + new Date().getTime().toString();
  }

  getSimilarTags(node: any, tagName: string): string[] {
    let parent = node;
    const ids: string[] = [];
    while(parent && parent.parentNode && (parent.parentNode as HTMLElement).id) {
      parent = parent.parentNode as HTMLElement;
      if (parent.id.startsWith(tagName)) {
        ids.push(parent.id);
      }
    }
    return ids;
  }

  getSimilarTagsByList(node: any, tagNames: string[]): string[] {
    let parent = node;
    const ids: string[] = [];
    while(parent && parent.parentNode && (parent.parentNode as HTMLElement).id) {
      parent = parent.parentNode as HTMLElement;
      tagNames.forEach(tagName => {
        if (parent.id.startsWith(tagName)) {
          ids.push(parent.id);
        }
      });
    }
    return ids;
  }

  removeAllHeadingTags(node: HTMLElement): HTMLElement {
    let parent = node.parentNode as HTMLElement; // first parent -> p
    let container = parent.parentElement; // parent of parent -> td
    for (let i = 0; i < this.headings.length; i++) {
      if (this.removeTags(container, parent, this.headings[i])) {
        break;
      }
    }
    return container;
  }

  removeTags(container: HTMLElement, parent: HTMLElement, tagName: string): boolean {
    const tagged = parent && parent.nodeName.toLowerCase() === tagName ? parent : null;
    if (tagged) {
      const outer = tagged.nodeType === 3 ? tagged.nodeValue : tagged.outerHTML;
      const inner = tagged.nodeType === 3 ? tagged.nodeValue : tagged.innerHTML;
      if (outer !== inner) {
        container.innerHTML = container.innerHTML.replace(outer, inner);
      }
      return true;
    }
    return false;
  }

  removeAllTags(container: HTMLElement, tagName: string): string {
    let html = container.innerHTML;
    const tags = container.querySelectorAll(tagName);
    tags.forEach(tag => {
      html = html.replace(tag.outerHTML, tag.innerHTML);
    });
    return html;
    //return container.innerHTML.replace(new RegExp(`<${tagName}[^<].*>(.*?)<\/${tagName}>`, 'gsi'), '$1');
    // if (container.childNodes && container.childNodes.length) {
    //   let html = '';
    //   for (let i = 0; i < container.childNodes.length; i++) {
    //     const node = container.childNodes[i];
    //     if (node.nodeName.toLowerCase() === tagName) {
    //       html += (node as HTMLElement).innerHTML;
    //     } else {
    //       if (node.nodeType === 3) {
    //         html += node.nodeValue;
    //       } else {
    //         if ((node as HTMLElement).innerHTML.includes('<' + tagName)) {
    //           html += this.removeAllTags(node as HTMLElement, tagName);
    //         } else {
    //           html += node.nodeType === 3 ? node.nodeValue : (node as HTMLElement).outerHTML;
    //         }
    //       }
    //     }
    //   }
    //   return html;
    //}
  }
}
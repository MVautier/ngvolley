import { HtmlNodeStyle } from "./html-node-style.model";

export class HtmlNode {
    tagName: string;
    className?: string;
    styles?: HtmlNodeStyle[];
    textContent?: string;
    href?: string
    divHtml?: string;
    src?: string;
    title?: string;
}
import { Size } from "./size.model";

export class ModalConfig {
    title: string;
    cancelLabel: string;
    validateLabel: string;
    size: Size;
    component: string;
    data?: any;
}
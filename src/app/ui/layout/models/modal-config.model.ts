import { Size } from "./size.model";

export class ModalConfig {
    title: string;
    cancelLabel: string;
    validateLabel: string;
    showCancel: boolean;
    showValidate: boolean;
    size: Size;
    component: string;
    data?: any;
}
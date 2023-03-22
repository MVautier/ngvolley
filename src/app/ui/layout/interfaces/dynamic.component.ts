import { ModalConfig } from "../models/modal-config.model";
import { ModalResult } from "../models/modal-result.model";

export interface DynamicComponent {
    config: ModalConfig;
    validate: (result: ModalResult) => void;
    cancel: (result: ModalResult) => void;
}
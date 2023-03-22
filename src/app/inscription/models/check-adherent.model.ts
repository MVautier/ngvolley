import { Adherent } from "@app/core/models/adherent.model";

export class CheckAdherent {
    found: Adherent;
    certifLabel: string;
    certifPlaceHolder: string;
    birthdayDateValid: boolean;
    parentAuthNeeded: boolean;
    certifNeeded: boolean;
    licenceError: boolean;
    valid: boolean;

    constructor() {
        this.found = null;
        this.certifLabel = 'Attestation ou certificat';
        this.certifPlaceHolder = 'Importer un certificat médical ou une attestation de santé';
        this.birthdayDateValid = false;
        this.parentAuthNeeded = false;
        this.certifNeeded = false;
        this.licenceError = false;
        this.valid = false;
    }
}
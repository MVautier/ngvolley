import { Adherent } from "@app/core/models/adherent.model";

export class CheckAdherent {
    found: Adherent;
    age: number;
    certifLabel: string;
    certifPlaceHolder: string;
    birthdayDateValid: boolean;
    parentAuthNeeded: boolean;
    certifNeeded: boolean;
    licenceNeeded: boolean;
    signatureNeeded: boolean;
    licenceError: boolean;
    accept: boolean;
    valid: boolean;

    constructor() {
        this.age = 0;
        this.found = null;
        this.certifLabel = 'Attestation ou certificat';
        this.certifPlaceHolder = 'Importer un certificat médical ou une attestation de santé';
        this.birthdayDateValid = false;
        this.parentAuthNeeded = false;
        this.certifNeeded = false;
        this.licenceNeeded = false;
        this.licenceError = false;
        this.signatureNeeded = false;
        this.valid = false;
        this.accept = false;
    }
}
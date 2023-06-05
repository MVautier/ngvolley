import { Adherent } from "@app/core/models/adherent.model";

export class StartInscription {
    local: boolean;
    already?: boolean;
    nom?: string;
    prenom?: string;
    section?: string;
    found?: Adherent;
}
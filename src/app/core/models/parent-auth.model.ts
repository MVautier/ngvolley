import { Adherent } from "./adherent.model";

export class ParentAuth {
    firstname: string;
    lastname: string;
    status: string;
    telfixe: string;
    mobile: string;
    child_firstname: string;
    child_lastname: string;
    child_birthdate: string;
    authorize: boolean;
    commune: string;
    date: string;
    signature: string;

    constructor(child: Adherent) {
        this.child_firstname = child.FirstName;
        this.child_lastname = child.LastName;
    }
}
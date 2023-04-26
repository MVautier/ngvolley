export class UserRole {
    IdUser: number;
    Nom: string;
    Prenom: string;
    Mail: string;
    //Password: string;
    CreationDate: Date;
    UpdateDate?: Date;
    EndDate?: Date;
    IdRole: number;
    Role: string;

    constructor() {
        this.IdUser = 0;
        this.IdRole = 3;
    }

}
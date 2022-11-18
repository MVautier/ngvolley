export class UserToken {
    IdUser!: number;
    id_token?: string;
    refresh_token: string;
    expire_in!: Date;
    firstname!: string;
    lastname!: string;

    constructor() {
        this.id_token = '';
        this.refresh_token = '';
    }
}


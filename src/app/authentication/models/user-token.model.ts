export class UserToken {
    IdUser!: number;
    id_token?: string;
    refresh_token: string;
    expire_in!: Date;

    constructor() {
        this.id_token = '';
        this.refresh_token = '';
    }
}


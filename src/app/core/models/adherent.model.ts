export class Adherent {
    firstname: string;
    lastname: string;
    sex: string;
    birthdate: Date;
    address: string;
    postalcode: string;
    city: string;
    phone: string;
    mobile: string;
    email: string;

    constructor(firstname: string = '', lastname: string = '', sex: string = 'F', birthdate: Date = null, address: string = '', 
        postalcode: string = '', city: string = '', phone: string = '', mobile: string = '', email: string = 'dominici.martial@orange.fr') {
            this.firstname = firstname;
            this.lastname = lastname;
            this.sex = sex;
            this.birthdate = birthdate;
            this.address = address;
            this.city = city;
            this.phone = phone;
            this.mobile = mobile;
            this.email = email;
    }
}
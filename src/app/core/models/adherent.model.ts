import { environment } from "@env/environment";
import { v4 as uuidv4 } from 'uuid';
import { AdherentDoc } from "./adherent-doc.model";

export class Adherent {
    private static debug = environment.debug;

    IdAdherent: number;
    Category?: string;
    Authorization?: string;
    FirstName: string;
    LastName: string;
    Genre: string;
    BirthdayDate?: Date;
    InscriptionDate?: Date;
    Age?: number;
    Address: string;
    PostalCode: string;
    City: string;
    Phone: string;
    ParentPhone?: string;
    Email: string;
    Payment?: string;
    Team1?: string;
    Team2?: string;
    Licence?: string;
    PaymentComment?: string;
    Membres?: Adherent[];
    Sections: string[];
    MainSectionInfo?: string;
    Relationship?: string;
    AlertFirstName?: string;
    AlertLastName?: string;
    AlertPhone?: string;
    RelationShip?: string;
    valid: boolean;
    Uid: string;
    Rgpd: boolean;
    ImageRight: boolean;
    TrainingTE?: boolean;
    TrainingFM?: boolean;
    TrainingFE?: boolean;
    Signature?: string;
    _opened?: boolean;
    HealthFile?: string;
    HealthStatementDate?: Date;
    CertificateFile?: string;
    CertificateDate?: Date;
    Photo?: string;
    Documents: AdherentDoc[];

    constructor(base: Adherent, cp: string = null) {
        this.IdAdherent = 0;
        this.Category = Adherent.debug ? 'C' : null; // convert to int for bdd
        this.Authorization = null;
        this.LastName = Adherent.debug ? 'Lacroix' : null;
        this.FirstName = Adherent.debug ? 'Stéphanie' : null;
        this.Genre = Adherent.debug ? 'F' : null;
        this.BirthdayDate = Adherent.debug ? new Date(1974, 5, 4) : null;
        this.InscriptionDate = null;
        this.Age = Adherent.debug ? 49 : null;
        this.HealthStatementDate = null;
        this.Phone = Adherent.debug ? '0603568888' : null;
        this.ParentPhone = null;
        this.Address = Adherent.debug ? '33 allée de la canche' : base?.Address;
        this.PostalCode = Adherent.debug ? '31770' : (base?.PostalCode || cp);
        this.City = Adherent.debug ? 'Colomiers' : base?.City;
        this.Email = Adherent.debug ? 'fanny.dominici@orange.fr' : null;
        this.Photo = null;
        this.Licence = Adherent.debug ? '297368' : null;
        this.Membres = [];
        this.AlertLastName = Adherent.debug ? 'DOMINICI' : null;
        this.AlertFirstName = Adherent.debug ? 'Martial' : null;
        this.AlertPhone = Adherent.debug ? '0620654010' : null;
        this.Uid = uuidv4();
        this.Sections = [];
        this.Rgpd = false;
        this.ImageRight = false;
        this.Signature = null;
        
        this.Payment = null;
        this.CertificateDate = null;
        this.CertificateFile = null;
        this.HealthFile = null;
        this.Documents = [];
        this.MainSectionInfo = null;
        this.valid = false;
        this._opened = true;
    }

    public static getAge(birthdate: Date): number {
        return birthdate ? new Date().getFullYear() - birthdate.getFullYear() : null;
    }

    public static addDoc(adherent: Adherent, type: string, filename: string, blob: Blob) {
        const doc: AdherentDoc = {
            filename: filename,
            type: type,
            blob: blob
        };
        const docs = adherent.Documents.filter(d => d.type !== type);
        docs.push(doc);
        adherent.Documents = docs;
    }

    public static fromJson(data: Adherent): Adherent {
        return {
            IdAdherent: data.IdAdherent,
            Category: data.Category,
            FirstName: data.FirstName,
            LastName: data.LastName,
            Genre: data.Genre,
            BirthdayDate: data.BirthdayDate ? new Date(data.BirthdayDate) : null,
            InscriptionDate: data.InscriptionDate ? new Date(data.InscriptionDate) : null,
            Age: 0,
            Address: data.Address,
            PostalCode: data.PostalCode,
            City: data.City,
            Phone: data.Phone,
            ParentPhone: data.ParentPhone,
            Email: data.Email,
            Licence: data.Licence,
            Membres: [],
            Sections: [],
            MainSectionInfo: null,
            Relationship: data.RelationShip,
            AlertFirstName: data.AlertFirstName,
            AlertLastName: data.AlertLastName,
            AlertPhone: data.AlertPhone,
            valid: false,
            Uid: null,
            Rgpd: data.Rgpd,
            ImageRight: data.ImageRight,
            Signature: data.Signature,
            PaymentComment: data.PaymentComment,
            Payment: data.PaymentComment,
            Photo: data.Photo,
            HealthFile: data.HealthFile,
            HealthStatementDate: data.HealthStatementDate ? new Date(data.HealthStatementDate) : null,
            CertificateFile: data.CertificateFile,
            CertificateDate: data.CertificateDate ? new Date(data.CertificateDate) : null,
            Authorization: data.Authorization,
            Documents: []
        }
    }
}
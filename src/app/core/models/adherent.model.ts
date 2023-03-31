import { environment } from "@env/environment";
import { v4 as uuidv4 } from 'uuid';

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
  HealthStatementDate?: Date;
  CertificateDate?: Date;
  Address: string;
  PostalCode: string;
  City: string;
  Phone: string;
  ParentPhone?: string;
  Email: string;
  Payment?: string;
  Photo?: string;
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
  HealthFile?: string;
  Rgpd: boolean;
  ImageRight: boolean;
  TrainingTE?: boolean;
  TrainingFM?: boolean;
  TrainingFE?: boolean;
  Signature?: string;
  _opened?: boolean;

  constructor(base: Adherent, cp: string = null) {
    this.IdAdherent = 0;
    this.InscriptionDate = null;
    this.Age = Adherent.debug ? 49 : null;
    this.HealthStatementDate = null;
    this.CertificateDate = null;
    this.ParentPhone = null;
    this.Payment = null;
    this.Membres = [];
    this.Sections = [];
    this.MainSectionInfo = null;
    this.valid = false;
    this.Uid = uuidv4();
    this.Rgpd = false;
    this.ImageRight = false;
    this.Photo = null;
    this.Category = Adherent.debug ? 'C' : null;;
    this.Authorization = Adherent.debug ? 'autorisation-parentale.pdf' : null;
    this.FirstName = Adherent.debug ? 'Stéphanie' : null;
    this.LastName = Adherent.debug ? 'Lacroix' : null;
    this.Genre = Adherent.debug ? 'F' : null;
    this.BirthdayDate = Adherent.debug ? new Date(1974, 5, 4) : null;
    this.Address = Adherent.debug ? '33 allée de la canche' : base?.Address;
    this.PostalCode = Adherent.debug ? '31770' : (base?.PostalCode || cp);
    this.City = Adherent.debug ? 'Colomiers' : base?.City;
    this.Phone = Adherent.debug ? '0603568888' : null;
    this.Email = Adherent.debug ? 'fanny.dominici@orange.fr' : null;
    this.HealthFile = Adherent.debug ? 'certificat.pdf' : null;
    this.Licence = Adherent.debug ? '297368' : null;
    this.AlertFirstName = Adherent.debug ? 'Martial' : null;
    this.AlertLastName = Adherent.debug ? 'DOMINICI' : null;
    this.AlertPhone = Adherent.debug ? '0620654010' : null;
    this.Signature = null;
    this._opened = true;
  }

  public static getAge(birthdate: Date): number {
    return birthdate ? new Date().getFullYear() - birthdate.getFullYear() : null;
  }

  public static fromJson(data: Adherent): Adherent {
    return {
      IdAdherent: data.IdAdherent,
      Category: data.Category,
      Authorization: data.Authorization,
      FirstName: data.FirstName,
      LastName: data.LastName,
      Genre: data.Genre,
      BirthdayDate: data.BirthdayDate ? new Date(data.BirthdayDate) : null,
      InscriptionDate: data.InscriptionDate ? new Date(data.InscriptionDate) : null,
      Age: 0,
      HealthStatementDate: data.HealthStatementDate ? new Date(data.HealthStatementDate) : null,
      CertificateDate: data.CertificateDate ? new Date(data.CertificateDate) : null,
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
      HealthFile: data.HealthFile,
      Rgpd: data.Rgpd,
      ImageRight: data.ImageRight,
      Photo: data.Photo,
      Signature: data.Signature
    }
  }
}
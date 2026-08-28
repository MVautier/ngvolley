import { environment } from "@env/environment";
import { v4 as uuidv4 } from 'uuid';
import { AdherentDoc } from "./adherent-doc.model";
import { Order } from "./order.model";
import { AdherentService } from "../services/adherent.service";
import { Histo } from "./histo.model";

export class Adherent {
  private static debug = environment.debug;

  IdAdherent: number;
  IdParent?: number;
  Category?: string;
  Authorization?: string;
  FirstName: string;
  LastName: string;
  Genre: string;
  BirthdayDate?: string;
  InscriptionDate?: string;
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
  Section: string;
  Sections: string[];
  VerifC3L?: string;
  Relationship?: string;
  Alert1?: string;
  Alert2?: string;
  Alert3?: string;
  RelationShip?: string;
  valid: boolean;
  OldUid: string;
  Uid: string;
  Rgpd: boolean;
  ImageRight: boolean;
  TrainingTE?: boolean;
  TrainingFM?: boolean;
  TrainingFE?: boolean;
  Signature?: string;
  _opened?: boolean;
  HealthFile?: string;
  HealthStatementDate?: string;
  CertificateFile?: string;
  CertificateDate?: string;
  Photo?: string;
  Documents: AdherentDoc[];
  Saison: number;
  Orders: Order[];
  Saved?: boolean;
  Histo: Histo[];
  /**
   * Part de la commande revenant au CLLL pour cet adherent (adhesion principale ou ligne
   * membre du foyer). Renseignee a l'inscription pour chaque personne, la commande ne
   * portant que le total. Permet a /orders de ventiler CLLL/CLUB ligne par ligne, y compris
   * pour les membres qui n'ont pas de commande propre.
   */
  CotisationC3L?: number;

  constructor(base: Adherent, cp: string = null, isMember = false, season: number) {
    this.IdAdherent = base && !isMember ? base.IdAdherent : 0;
    this.IdParent = base && !isMember ? base.IdParent : null;
    this.Category = base && !isMember ? base.Category : Adherent.debug ? 'C' : null; // convert to int for bdd
    this.Authorization = base ? base.Authorization : null;
    this.LastName = base ? base.LastName : Adherent.debug ? 'LACROIX' : null;
    this.FirstName = base && !isMember ? base.FirstName : Adherent.debug ? 'Stéphanie' : null;
    this.Genre = base && !isMember ? base.Genre : Adherent.debug ? 'F' : null;
    this.BirthdayDate = base && !isMember ? base.BirthdayDate : Adherent.debug ? '1974-06-04' : null;
    this.InscriptionDate = base?.InscriptionDate || null;
    this.Age = base && !isMember ? base.Age : Adherent.debug ? 49 : null;
    this.HealthStatementDate = null;
    this.Phone = base && !isMember ? base.Phone : Adherent.debug ? '0603568888' : null;
    this.ParentPhone = base && !isMember ? base.ParentPhone : null;
    this.Address = base ? base.Address : Adherent.debug ? '33 allée de la canche' : base?.Address;
    this.PostalCode = base ? base.PostalCode : Adherent.debug ? '31770' : cp;
    this.City = base ? base.City : Adherent.debug ? 'Colomiers' : base?.City;
    this.Email = base && !isMember ? base.Email : Adherent.debug ? 'fanny.dominici@orange.fr' : null;
    this.Photo = base ? base.Photo : null;
    this.Licence = base && !isMember ? base.Licence : Adherent.debug ? '297368' : null;
    this.Team1 = base && !isMember ? base.Team1 : null;
    this.Team2 = base && !isMember ? base.Team2 : null;
    this.Membres = base && !isMember ? base.Membres : [];
    this.Alert1 = base ? base.Alert1 : Adherent.debug ? 'DOMINICI Martial 06 20 65 40 10' : null;
    this.Alert2 = base ? base.Alert2 : Adherent.debug ? null : null;
    this.Alert3 = base ? base.Alert3 : Adherent.debug ? null : null;
    this.Uid = base && base.Uid && !isMember ? base.Uid : uuidv4();
    this.OldUid = this.Uid;
    this.Section = base ? base.Section : Adherent.debug ? 'C' : null;
    this.Sections = base ? base.Sections : [];
    this.Rgpd = base ? base.Rgpd : false;
    this.ImageRight = true;
    this.Signature = null; //base ? base.Signature : null;
    this.Saison = season;

    this.Payment = base ? base.Payment : null;
    this.PaymentComment = base ? base.PaymentComment : null;
    this.CertificateDate = base ? base.CertificateDate : null;
    this.CertificateFile = base ? base.CertificateFile : null;
    this.HealthFile = base ? base.HealthFile : null;
    this.Documents = base ? base.Documents : [];
    this.VerifC3L = base ? base.VerifC3L : null;
    this.valid = false;
    this._opened = true;
    this.Orders = base ? base.Orders : [];
    this.Histo = base ? base.Histo : [];
    this.CotisationC3L = null;
  }

  public static getAge(birthdate: string): number {
    if (!birthdate) return null;
    const year = Number(birthdate.substring(0, 4));
    return new Date().getFullYear() - year;
  }

  public static addDoc(adherent: Adherent, type: string, filename: string, blob: Blob) {
    const doc: AdherentDoc = {
      filename: filename,
      type: type,
      blob: blob,
      sent: false
    };
    if (!adherent.Documents) {
      adherent.Documents = [];
    }
    const docs = adherent.Documents.filter(d => d.type !== type);
    docs.push(doc);
    adherent.Documents = docs;
  }

  public static fromJson(data: Adherent, admin: boolean = false): Adherent {
    const saison = data.Saison;

    return {
      IdAdherent: data.IdAdherent,
      IdParent: data.IdParent,
      Category: data.Category,
      Section: data.Section,
      FirstName: data.FirstName,
      LastName: data.LastName,
      Genre: data.Genre,
      BirthdayDate: data.BirthdayDate,
      InscriptionDate: data.InscriptionDate,
      Age: 0,
      Address: data.Address,
      PostalCode: data.PostalCode,
      City: data.City,
      Phone: data.Phone,
      ParentPhone: data.ParentPhone,
      Email: data.Email,
      Licence: data.Licence,
      Team1: data.Team1,
      Team2: data.Team2,
      Membres: data.Membres || [],
      Sections: data.Sections || [],
      VerifC3L: data.VerifC3L,
      Relationship: data.RelationShip,
      Alert1: data.Alert1,
      Alert2: data.Alert2,
      Alert3: data.Alert3,
      valid: false,
      Uid: data.Uid,
      OldUid: null,
      // Documents
      ImageRight: admin && data.ImageRight ? data.ImageRight : false,
      Rgpd: admin && data.Rgpd ? data.Rgpd : false,
      Signature: admin && data.Signature ? data.Signature : null,
      PaymentComment: data.PaymentComment,
      Payment: admin && data.Payment ? data.Payment : null,
      Photo: admin && data.Photo ? data.Photo : null,
      HealthFile: admin && data.HealthFile ? data.HealthFile : null,
      HealthStatementDate: admin && data.HealthStatementDate ? data.HealthStatementDate : null,
      CertificateFile: admin && data.CertificateFile ? data.CertificateFile : null,
      CertificateDate: admin && data.CertificateDate ? data.CertificateDate : null,
      Authorization: admin && data.Authorization ? data.Authorization : null,
      // Fin documents
      Documents: [],
      Saison: data.Saison,
      Orders: Order.fromJsonList(data.Orders),
      Histo: Histo.fromJsonList(data.Histo),
      CotisationC3L: data.CotisationC3L
    }
  }
}
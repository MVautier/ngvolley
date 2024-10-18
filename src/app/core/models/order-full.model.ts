import { Adherent } from "./adherent.model";
import { Order } from "./order.model";

export class OrderFull {
  Id: number;
  IdPaiement: number;
  IdAdherent: number;
  CotisationC3L: number;
  Date: Date;
  Total: number;
  Nom: string;
  Prenom: string;
  Email: string;
  DateNaissance: Date;
  PaymentLink: string;

  IdParent: number;
  Membres: Adherent[];
  LastName: string;
  FirstName: string;
  BirthdayDate: Date;
  Payment: string;
  InscriptionDate: Date;

  constructor(adherent: Adherent, order: Order) {
    return {
      Id: order?.Id,
      IdPaiement: order?.IdPaiement,
      IdAdherent: order?.IdAdherent || adherent.IdAdherent,
      Date: order?.Date ? new Date(order?.Date) : order?.Date,
      CotisationC3L: order?.CotisationC3L,
      Total: order?.Total,
      Nom: order?.Nom,
      Prenom: order?.Prenom,
      Email: order?.Email,
      DateNaissance: order?.DateNaissance,
      PaymentLink: order?.PaymentLink,
      IdParent: adherent.IdParent,
      Membres: adherent.Membres,
      LastName: adherent.LastName,
      FirstName: adherent.FirstName,
      BirthdayDate: adherent.BirthdayDate,
      Payment: adherent.PaymentComment,
      InscriptionDate: adherent.InscriptionDate
    };
  }
}
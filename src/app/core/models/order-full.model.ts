import { Adherent } from "./adherent.model";
import { Order } from "./order.model";

export class OrderFull {
  Id: number;
  IdPaiement: number;
  IdAdherent: number;
  Saison: number;
  CotisationC3L: number;
  Date: Date;
  Total: number;
  Nom: string;
  Prenom: string;
  Email: string;
  DateNaissance: string;
  PaymentLink: string;

  IdParent: number;
  Membres: Adherent[];
  LastName: string;
  FirstName: string;
  BirthdayDate: string;
  Payment: string;
  InscriptionDate: string;
  PaymentMode: string;
  /**
   * Part CLLL de cette personne, portee par l'adherent et non par la commande. Seule donnee
   * disponible pour ventiler la ligne d'un membre du foyer, qui n'a pas de commande propre :
   * CotisationC3L, lui, porte le total CLLL de toute la commande du payeur.
   */
  C3lShare: number;
  /** Lien de parente d'un membre du foyer avec le payeur (P, C, E, F, S). */
  Relationship: string;

  constructor(adherent: Adherent, order: Order) {
    return {
      Id: order?.Id,
      IdPaiement: order?.IdPaiement,
      IdAdherent: order?.IdAdherent || adherent.IdAdherent,
      Saison: order?.Saison || adherent.Saison,
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
      InscriptionDate: adherent.InscriptionDate,
      PaymentMode: order ? 'Helloasso' : 'Manuel',
      C3lShare: adherent.CotisationC3L,
      Relationship: adherent.Relationship
    };
  }
}
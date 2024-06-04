import { Adherent } from "@app/core/models/adherent.model";

export class StartInscription {
  local: boolean;
  already?: boolean;
  nom?: string;
  prenom?: string;
  already2?: boolean;
  lien?: string;
  nom2?: string;
  prenom2?: string;
  section?: string;
  found?: Adherent;
}
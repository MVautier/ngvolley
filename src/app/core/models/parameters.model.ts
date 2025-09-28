export class Parameters {
  IdParametre: number;
  InscriptionOpened: boolean;
  Reinscription: boolean;
  InscriptionFilter: string;
  AdoOpened: boolean;
  LoisirOpened: boolean;
  CompetOpened: boolean;
  NbAdoMax: number;
  TarifLocal: number;
  TarifExterior: number;
  TarifMember: number;
  TarifLoisir: number;
  TarifLicense: number;
  TarifAdo: number;
  SubHeader: string;
  Text1: string;
  Text2: string;
  Text3: string;

  public static fromJson(data: Parameters): Parameters {
    return {
      IdParametre: data?.IdParametre,
      InscriptionOpened: data?.InscriptionOpened,
      Reinscription: data?.Reinscription,
      InscriptionFilter: data?.InscriptionFilter,
      AdoOpened: data?.AdoOpened,
      LoisirOpened: data?.LoisirOpened,
      CompetOpened: data?.CompetOpened,
      NbAdoMax: data?.NbAdoMax,
      TarifLocal: data?.TarifLocal,
      TarifExterior: data?.TarifExterior,
      TarifMember: data?.TarifMember,
      TarifLoisir: data?.TarifLoisir,
      TarifLicense: data?.TarifLicense,
      TarifAdo: data?.TarifAdo,
      SubHeader: data?.SubHeader,
      Text1: data?.Text1,
      Text2: data?.Text2,
      Text3: data?.Text3
    };
  }
}
import { EnumPayment } from "../enums/payment.enum";
import { DateRange } from "./date-range.model";
import { DynamicFilter } from "./dynamic-filter.model";

export class AdherentFilter {
  Payment?: EnumPayment;
  HasPhoto?: boolean;
  HasLicence?: boolean;
  IdSection?: number;
  IdCategory?: number;
  DynamicFilter?: DynamicFilter;
  DateRange?: DateRange;
  Team?: string;
  Saison?: number;

  constructor(saison: number = null, field: string = null, operator: string = 'Equals', value: string = null, payment: EnumPayment = EnumPayment.Tous) {
    const now = new Date();
    this.Payment = payment;
    this.HasPhoto = null;
    this.HasLicence = null;
    this.IdSection = null;
    this.IdCategory = null;
    this.Team = null;
    this.Saison = saison;
    this.DynamicFilter = {
      Field: field,
      Operator: operator,
      Value: value
    };
    this.DateRange = {
      Start: null,
      End: now
    }
  }
}
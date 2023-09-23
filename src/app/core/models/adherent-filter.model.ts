import { DateRange } from "./date-range.model";
import { DynamicFilter } from "./dynamic-filter.model";

export class AdherentFilter{
    HasPaid?: boolean;
    HasPhoto?: boolean;
    HasLicence?: boolean;
    IdSection?: number;
    IdCategory?: number;
    DynamicFilter?: DynamicFilter;
    DateRange?: DateRange;
    Team?: string;

    constructor(field: string = null) {
        const now = new Date();
        this.HasPaid = null;
        this.HasPhoto = null;
        this.HasLicence = null;
        this.IdSection = null;
        this.IdCategory = null;
        this.Team = null;
        this.DynamicFilter = {
            Field: field,
            Operator: 'Equals',
            Value: null
        };
        this.DateRange = {
            Start: null,
            End: now
        }
    }
}
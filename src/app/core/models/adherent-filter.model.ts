import { DateRange } from "./date-range.model";
import { DynamicFilter } from "./dynamic-filter.model";

export class AdherentFilter{
    HasPhoto?: boolean;
    HasLicence?: boolean;
    IdSection?: number;
    IdCategory?: number;
    DynamicFilter?: DynamicFilter;
    DateRange?: DateRange;

    constructor(field: string = null) {
        const now = new Date();
        this.HasPhoto = null;
        this.HasLicence = null;
        this.IdSection = null;
        this.IdCategory = null;
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
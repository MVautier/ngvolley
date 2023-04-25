import { Operator } from "./operator.model";

export class Filter {
    field: string;
    alias: string;
    value: string;
    operator: Operator;
}
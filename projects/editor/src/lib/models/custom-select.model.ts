import { SelectOption } from "../../lib/components/ng-select/ng-select.component";
import { Command } from "./command.model";

export class CustomSelect {
    options: SelectOption[];
    onSelect: Command;
    resetOnSelect?: boolean;
}
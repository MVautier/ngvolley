export class UndoItem {
    element: HTMLElement;
    originalContent: string;
    newContent?: string;
    undo?: any;
    redo?: any;
}
export class WebItem {
    id?: number;
    oldpath?: string;
    IdItem: number;
    Title: string;
    Content?: string;
    Date?: Date;
    Modified?: Date;
    Type: string;
    Slug?: string;
    Description?: string;
    Resume?: string;
    Ip?: string;
    Order?: number;
    Public: boolean;
    Author?: string;
    IdAuthor?: number;
    IdParent?: number;
    IdCategory?: number;
    IdPost?: number;
    IdPages?: number[];

    constructor(idItem: number, title: string, type: string, _public?: boolean, slug?: string, id?: number, oldpath?: string, content?: string, date?: Date, modified?: Date, 
        description?: string, resume?: string, order?: number, author?: string, idauthor?: number, idparent?: number, idcategory?: number, idpost?: number, idpages?: number[]) {
        return {
            IdItem: idItem,
            Title: title,
            Type: type,
            Public: _public,
            Slug: slug,
            id: id,
            oldpath: oldpath,
            Content: content,
            Date: date,
            Modified: modified,
            Description: description,
            Resume: resume,
            Order: order,
            Author: author,
            IdAuthor: idauthor,
            IdParent: idparent,
            IdCategory: idcategory,
            IdPost: idpost,
            IdPages: idpages
        };
    }

    public static copyItem(src: WebItem):WebItem {
        return new WebItem(src.IdItem, src.Title, src.Type, src.Public, src.Slug, src.id, src.oldpath, src.Content, src.Date, src.Modified, src.Description, src.Resume, 
            src.Order, src.Author, src.IdAuthor, src.IdParent, src.IdCategory, src.IdPost, src.IdPages);
    }

    public static newItem(type: string): WebItem {
        return new WebItem(0, 'Nouvelle page', type, true);
    }

}
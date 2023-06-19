export class Order {
    Id: number;
    IdPaiement: number;
    IdAdherent: number;
    CotisationC3L: number;
    Date: Date;
    Total: number;
    Nom: string;
    Prenom: string;
    Email: string;
    DateNaissance: Date;
    PaymentLink: string;

    public static fromJson(data: Order): Order {
        return {
            Id: data?.Id,
            IdPaiement: data?.IdPaiement,
            IdAdherent: data?.IdAdherent,
            Date: data?.Date ? new Date(data?.Date) : data?.Date,
            CotisationC3L: data?.CotisationC3L,
            Total: data?.Total,
            Nom: data?.Nom,
            Prenom: data?.Prenom,
            Email: data?.Email,
            DateNaissance: data?.DateNaissance,
            PaymentLink: data?.PaymentLink
        };
    }
}
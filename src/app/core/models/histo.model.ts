export class Histo {
  saison: number;
  date: string;
  category: number;

  public static fromJson(data: Histo): Histo {
    return {
      saison: data?.saison,
      date: data?.date,
      category: data?.category
    };
  }

  public static fromJsonList(data: Histo[]): Histo[] {
    var histo: Histo[] = [];
    data.forEach(d => {
      histo.push(this.fromJson(d));
    })
    return histo;
  }
}
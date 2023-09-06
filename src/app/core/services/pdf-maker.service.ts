
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import domtoimage from 'dom-to-image';
import jsPDF, { TextOptionsLight } from 'jspdf';
import autoTable, { Color, ThemeType } from 'jspdf-autotable';
import { PdfFooter } from '../models/pdf-footer.model';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Questionary } from '../models/questionary.model';
import { RowInput } from 'jspdf-autotable';
import { ParentAuth } from '../models/parent-auth.model';
import { AdherentDoc } from '../models/adherent-doc.model';
import { Adherent } from '../models/adherent.model';
import { UtilService } from './util.service';
import { FileService } from './file.service';

@Injectable()
export class PdfMakerService {
    heightP: number = 826;
    heightL: number = 826;
    scale = 2;
    ratio = 0.75292857248934;
    theme: ThemeType = 'grid';
    tableLineColor: Color = [189, 195, 199];
    currencyFormat = new Intl.NumberFormat('fr-FR');
    constructor(
        private datePipe: DatePipe, 
        private currencyPipe: CurrencyPipe, 
        private decimalPipe: DecimalPipe,
        private fileService: FileService) {

    }

    buildAndSendPdf(id: string, name: string, item: HTMLElement): Promise<string> {
        return new Promise((resolve, reject) => {
            const footer = this.getFooter(item, 'p');
            this.captureHTML(item).then(base64 => {
                this.buildPdf(base64, footer).then((blob) => {
                    const formData = this.fileService.getFormData(id, name, blob);
                    this.fileService.sendDoc(formData).then((file) => {
                        resolve(file);
                    })
                        .catch(err => {
                            reject('error sending pdf: ' + JSON.stringify(err));
                        });
                })
                    .catch(err => {
                        reject('error building pdf: ' + JSON.stringify(err));
                    });
            })
                .catch(err => {
                    reject('error capturing html: ' + JSON.stringify(err));
                });
        });
    }

    sendAllDocuments(adherent: Adherent): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const promises: Promise<boolean>[] = [];
            if (adherent.Membres.length) {
                adherent.Membres.forEach(m => {
                    if (m.Documents.length) {
                        promises.push(this.sendDocuments(m.Uid, m.Documents));
                    }
                });
            }
            promises.push(this.sendDocuments(adherent.Uid, adherent.Documents));
            Promise.all(promises).then(results => {
                const ok = results.filter(r => !r).length === 0; 
                resolve(ok);
            }).catch(err => {
                reject('error sending documents: ' + JSON.stringify(err));
            })
        });
    }

    sendDocuments(id: string, docs: AdherentDoc[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const fd = this.fileService.getFormDataMultiple(id, docs);
            if (fd) {
                this.fileService.sendDocs(fd).then((result) => {
                    resolve(result);
                }).catch(err => {
                    reject('error sending documents: ' + JSON.stringify(err));
                });
            } else {
                resolve(true);
            }
        });
    }

    buildHealthForm(data: Questionary, forUser: boolean = true): Promise<Blob> {
        return new Promise((resolve) => {
            if (!data.nom && !data.prenom) resolve(null);
            try {
                const filename = `attestation`;
                if (forUser) {
                    if (data.mode === 'minor') {
                        this.buildHealthFormMinor(data, filename);
                    }
                    if (data.mode === 'major') {
                        this.buildHealthFormMajor(data, filename);
                    }
                    resolve(null);
                } else {
                    let blob: Blob = null;
                    if (data.mode === 'minor') {
                        blob = this.buildEndHealthFormMinor(data);
                    }
                    if (data.mode === 'major') {
                        blob = this.buildEndHealthFormMajor(data);
                    }
                    resolve(blob);
                }
            } catch (err) {
                resolve(null);
            }
        });
    }

    buildParentAuth(data: ParentAuth): Promise<Blob> {
        return new Promise((resolve) => {
            if (!data.child_firstname && !data.child_lastname) resolve(null);
            try {
                const blob: Blob = this.buildParentAuthBlob(data);
                resolve(blob);
            } catch (err) {
                resolve(null);
            }
        });
    }

    buildAdherentForm(data: Adherent, signature: string = null): Promise<Blob> {
        return new Promise((resolve) => {
            try {
                const blob: Blob = this.buildAdherentFormBlob(data, signature);
                resolve(blob);
            } catch(err) {
                resolve(null);
            }
        });
    }

    buildOrderList(data: Adherent[], title: string): Promise<Blob> {
        return new Promise((resolve) => {
            try {
                const blob: Blob = this.buildOrderListBlob(data, title);
                resolve(blob);
            } catch(err) {
                resolve(null);
            }
        });
    }

    private buildOrderListBlob(data: Adherent[], title: string): Blob {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });
        doc.setLanguage('fr');

        // Logo
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);

         // Titre
         let xOffset = (doc.internal.pageSize.width / 2);
         let yOffset = 40;
         let text = '';
         doc.text(title, xOffset, yOffset, { align: 'center' });
         const textWidth = doc.getTextWidth(title);
         yOffset += 10;
         doc.line(xOffset - (textWidth / 2), yOffset, xOffset + (textWidth / 2), yOffset);

         // Headers
        var columns: RowInput[] = [
            [{ content: 'N°', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255] , halign: 'center'} },
            { content: 'Date', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'Nom', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'Prénom', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'Naissance', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'CLLL', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'Club', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } },
            { content: 'Total', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom', halign: 'center' } }
        ]
        ];

        // Rows
        const rows: RowInput[] = [];
        let totalC3l = 0;
        let totalClub = 0;
        let totalGen = 0;
        // let i = 0;
        // const nb = 50;
        // const d = data[0];
        // for (let i = 0; i < nb; i++) {
        //     const o = d.Order;
        //     const c3l = o.CotisationC3L;
        //     const total = o.Total;
        //     const club = total - c3l;
        //     totalC3l += c3l;
        //     totalClub += club;
        //     totalGen += total;
        //     rows.push([
        //         //{ content: o.IdPaiement, styles: { halign: 'left', textColor: [255, 255, 255], fillColor: [192, 32, 38] } }
        //         { content: o.IdPaiement, styles: { halign: 'left' } },
        //         { content: this.datePipe.transform(o.Date, 'dd/MM/yyyy'), styles: { halign: 'left' } },
        //         { content: d.LastName, styles: { halign: 'left' } },
        //         { content: d.FirstName, styles: { halign: 'left' } },
        //         { content: this.formatCurrency(c3l), styles: { halign: 'right' } },
        //         { content: this.formatCurrency(club), styles: { halign: 'right' } },
        //         { content: this.formatCurrency(total), styles: { halign: 'right' } }
        //     ]);
        // }
        data.forEach(d => {
            const o = d.Order;
            const c3l = o.CotisationC3L;
            const total = o.Total;
            const club = total - c3l;
            totalC3l += c3l;
            totalClub += club;
            totalGen += total;
            rows.push([
                //{ content: o.IdPaiement, styles: { halign: 'left', textColor: [255, 255, 255], fillColor: [192, 32, 38] } }
                { content: o.IdPaiement, styles: { halign: 'left' } },
                { content: this.datePipe.transform(o.Date, 'dd/MM/yyyy'), styles: { halign: 'left' } },
                { content: d.LastName, styles: { halign: 'left' } },
                { content: d.FirstName, styles: { halign: 'left' } },
                { content: this.datePipe.transform(d.InscriptionDate, 'dd/MM/yyyy'), styles: { halign: 'left' } },
                { content: this.currencyPipe.transform(c3l, 'EUR', 'symbol', '1.2-2', 'fr'), styles: { halign: 'right' } },
                { content: this.currencyPipe.transform(club, 'EUR', 'symbol', '1.2-2', 'fr'), styles: { halign: 'right' } },
                { content: this.currencyPipe.transform(total, 'EUR', 'symbol', '1.2-2', 'fr'), styles: { halign: 'right' } }
            ]);
        });

        // Totaux
        rows.push([
            {
                content: 'Totaux', colSpan: 5, styles: { halign: 'center' }
            }, 
            {
                content: this.formatCurrency(totalC3l), styles: { halign: 'right' }
            }, 
            {
                content: this.formatCurrency(totalClub), styles: { halign: 'right' }
            }, 
            {
                content: this.formatCurrency(totalGen), styles: { halign: 'right' }
            }
        ]);

        // Table
        autoTable(doc, {
            tableLineColor: this.tableLineColor,
            tableLineWidth: 0.75,
            theme: this.theme,
            head: columns,
            body: rows,
            startY: 100,
            // didDrawCell: (data) => {
            //     if (data.section === 'body') {
            //         // Dessin des checkboxes
            //         if ((data.column.index === 1 || data.column.index === 2) && !data.cell.text.includes('')) {
            //             data.cell.styles.font = 'courrier';
            //             data.cell.styles.halign = 'center';
            //             this.drawCheckbox(doc, data.cell.x + x, data.cell.y + y);
            //         }
            //     }
            // }
        });

        return new Blob([doc.output('blob')], { type: 'application/pdf' });
    }

    private formatCurrency(value: number): string {
        const result = this.currencyFormat.format(value).replace(/ /, ' ');
        return '' + result + ',00 €';
    }

    private buildAdherentFormBlob(data: Adherent, signature: string = null): Blob {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });

        // Logo
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);

        // Titre
        let xOffset = (doc.internal.pageSize.width / 2);
        let yOffset = 40;
        const y = new Date().getFullYear();
        let text = `Bulletin d\'adhésion ${y}-${y + 1}`;
        doc.text(text, xOffset, yOffset, { align: 'center' });
        text = `Club Loisirs Léo Lagrange de Colomiers`;
        yOffset += 20;
        doc.text(text, xOffset, yOffset, { align: 'center' });
        const textWidth = doc.getTextWidth(text);
        yOffset += 10;
        doc.line(xOffset - (textWidth / 2), yOffset, xOffset + (textWidth / 2), yOffset);

        doc.setFontSize(10);

        // Pavé adresse
        xOffset = 34;
        yOffset = 150;
        doc.setFont('helvetica', 'bold');
        text = `Club Loisirs Léo Lagrange`;
        doc.text(text, xOffset, yOffset);
        yOffset += 12;
        doc.setFont('helvetica', 'normal');
        text = `6, Place du Val d\'Aran - 31770 Colomiers`;
        doc.text(text, xOffset, yOffset);
        yOffset += 12;
        text = `Tél : 05 61 78 60 52`;
        doc.text(text, xOffset, yOffset);
        yOffset += 12;
        text = `secretariat@leolagrangecolomiers.org`;
        doc.text(text, xOffset, yOffset);

        // Adhésion multiple/individuelle
        xOffset = 450;
        yOffset = 150;
        this.drawCheckbox(doc, xOffset, yOffset);
        text = `Adhésion Individuelle`;
        doc.text(text, xOffset + 25, yOffset + 9);
        if (!data.Membres?.length) {
            doc.text('X', xOffset + 2, yOffset + 9);
        }
        yOffset += 20;
        this.drawCheckbox(doc, xOffset, yOffset);
        text = `Adhésion Multiple`;
        doc.text(text, xOffset + 25, yOffset + 9);
        if (data.Membres?.length) {
            doc.text('X', xOffset + 2, yOffset + 9);
        }

        // Sections
        xOffset = 34;
        yOffset += 50;
        doc.setFont('helvetica', 'bold');
        text = 'Section(s) : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        if (data.Sections?.length) {
            xOffset += 60;
            text = data.Sections.join(', ');
            doc.text(text, xOffset, yOffset);
        }

        // Infos générales
        xOffset = 34;
        yOffset = 240;
        
        // Gauche
        doc.setFont('helvetica', 'bold');
        text = 'Nom : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.LastName, xOffset + 70, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Genre : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(this.getLibGenre(data.Genre), xOffset + 70, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Adresse : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Address, xOffset + 70, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Code postal : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.PostalCode, xOffset + 70, yOffset);7

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Téléphone : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Phone, xOffset + 70, yOffset);

        // Droite
        xOffset = 300; 
        yOffset = 240;
        doc.setFont('helvetica', 'bold');
        text = 'Prénom : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.FirstName, xOffset + 50, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Date de naissance : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(this.datePipe.transform(data.BirthdayDate, 'dd/MM/yyyy'), xOffset + 100, yOffset);

        yOffset += 40;
        doc.setFont('helvetica', 'bold');
        text = 'Ville : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.City, xOffset + 50, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Email : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Email, xOffset + 50, yOffset);


        yOffset += 40;
        text = `Personne(s) à prévenir en cas d\'urgence`;
        doc.setFont('helvetica', 'bold');
        doc.text(text, xOffset, yOffset, { align: 'center' });

        xOffset = 34;
        yOffset += 40;
        doc.setFont('helvetica', 'bold');
        text = '1ère personne : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Alert1 || '', xOffset + 100, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = '2ème personne : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Alert2 || '', xOffset + 100, yOffset);

        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = '3ème personne : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.Alert3 || '', xOffset + 100, yOffset);

        // Autres membres
        xOffset = 300;
        yOffset += 40;
        doc.setFont('helvetica', 'bold');
        text = 'Autres membres';
        doc.text(text, xOffset, yOffset, { align: 'center' });

        xOffset = 34;
        yOffset += 20;
        if (data.Membres?.length) {
            let xm = xOffset;
            let ym = yOffset;
            let i = 2;
            doc.setFont('helvetica', 'bold');
            this.writeMemberHeader(doc, xm, ym + 20, 20);
            doc.setFont('helvetica', 'normal');
            data.Membres.forEach(m => {
                xm += i == 2 ? 120 : 150;
                ym = yOffset;
                this.writeMemberColumn(doc, m, i, xm, ym, 20);
                i++;
            });
        } else {
            doc.text('Aucun membre', xOffset, yOffset);
        }

        try {
            if (signature || data.Signature) {
                yOffset += data.Membres?.length ? 200 : 30;
            }
            if (signature) {
                doc.addImage(signature, 50, yOffset, 300, 150);
            } else if (data.Signature) {
                doc.addImage(data.Signature, 50, yOffset, 300, 150);
            }
        } catch(err) {
            console.log('error adding signature in adhesion: ', err);
        }
        //doc.save('adhesion.pdf');

        return new Blob([doc.output('blob')], { type: 'application/pdf' });
    }

    private writeMemberHeader(doc: jsPDF, x: number, y: number, inc: number) {  
        y += inc;
        let text = 'Nom';
        doc.text(text, x, y);
        y += inc;
        text = 'Prénom';
        doc.text(text, x, y);
        y += inc;
        text = 'Téléphone';
        doc.text(text, x, y);
        y += inc;
        text = 'Lien de parenté';
        doc.text(text, x, y);
        y += inc;
        text = 'Date de naissance';
        doc.text(text, x, y);
        y += inc;
        text = 'Genre';
        doc.text(text, x, y);
        y += inc;
        text = 'Email';
        doc.text(text, x, y);
        y += inc;
        text = 'Sections';
        doc.text(text, x, y);
    }

    private writeMemberColumn(doc: jsPDF, m: Adherent, i: number, x: number, y: number, inc: number) {
        doc.setFont('helvetica', 'bold');
        y += inc;
        let text = 'Adhérent ' + i;
        doc.text(text, x, y);
        doc.setFont('helvetica', 'normal');
        y += inc;
        doc.text(m.LastName, x, y);
        y += inc;
        doc.text(m.FirstName, x, y);
        y += inc;
        doc.text(m.Phone, x, y);
        y += inc;
        doc.text(this.getLibParente(m.Relationship), x, y);
        y += inc;
        doc.text(this.datePipe.transform(m.BirthdayDate, 'dd/MM/yyyy'),x, y);
        y += inc;
        doc.text(this.getLibGenre(m.Genre), x, y);
        y += inc;
        doc.text(m.Email, x, y);
        y += inc;
        doc.text(m.Sections.length ? m.Sections.join(',') : '-', x, y);
    }

    private getLibGenre(code: string): string {
        let value = '';
        switch (code) {
            case 'M': 
                value = 'Masculin';
                break;
            case 'F': 
                value = 'Féminin';
                break;
            case 'A': 
                value = 'Autre';
                break;
        }
        return value;
    }

    private getLibParente(code: string): string {
        let value = '';
        switch (code) {
            case 'P': 
                value = 'Parent';
                break;
            case 'C': 
                value = 'Conjoint';
                break;
            case 'E': 
                value = 'Enfant';
                break;
            case 'F': 
                value = 'Frère';
                break;
            case 'S': 
                value = 'Soeur';
                break;
        }
        return value;
    }

    private buildParentAuthBlob(data: ParentAuth): Blob {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });

        // Logos and Title
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);
        //doc.addImage('assets/images/logos/rf.png', 'JPEG', doc.internal.pageSize.width - 109, 10, 75, 50);

        let xOffset = (doc.internal.pageSize.width / 2);
        let text = 'AUTORISATION PARENTALE';
        doc.text(text, xOffset, 120, { align: 'center' });
        const textWidth = doc.getTextWidth(text);
        doc.line(xOffset - (textWidth / 2), 130, xOffset + (textWidth / 2), 130);

        xOffset = 34;
        let yOffset = 300;
        doc.setFontSize(10);
        let contact = 'joignable au '
        if (data.telfixe && data.mobile) {
            contact += data.telfixe + ' ou au ' + data.mobile;
        } else if (data.telfixe) {
            contact += data.telfixe;
        } else if (data.mobile) {
            contact += data.mobile;
        }

        text = `Je soussigné(e), ${data.lastname} ${data.firstname} en qualité de ${data.status.toLowerCase()} ${contact}
autorise mon enfant ${data.child_lastname} ${data.child_firstname} né(e) le ${data.child_birthdate} à adhérer à la section Volley-ball (y compris toutes les activités 
proposées par cette section) et les responsables à faire procéder à toute intervention médicale d'urgence.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 50;
        text = data.authorize ? `J'autorise` : `Je n'autorise pas`;
        text += ` mon enfant à quitter seul les installations de Volley-Ball dès la fin des entraînements ou dès le retour au 
point de rendez-vous, après un tournoi ou une sortie organisée par CLLL Colomiers.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 50;
        text = `Les responsables dégagent leur responsabilité dès la sortie des enfants du gymnase.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 100;
        text = `Fait à ${data.commune}, le ${data.date}`;
        doc.text(text, xOffset, yOffset);

        yOffset += 30;
        text = `Signature`;
        doc.text(text, xOffset, yOffset);

        if (data.signature) {
            yOffset += 30;
            doc.addImage(data.signature, 50, yOffset, 300, 150);
        }
        
        return new Blob([doc.output('blob')], { type: 'application/pdf' });
    }

    private buildHealthFormMajor(data: Questionary, filename: string) {

        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });

        let x = 15, y = 5, w = 10, chkWidth = 40;

        // Logos and Title
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);
        doc.addImage('assets/images/logos/rf.png', 'JPEG', doc.internal.pageSize.width - 109, 10, 75, 50);

        const xOffset = (doc.internal.pageSize.width / 2);
        doc.text(data.title, xOffset, 120, { align: 'center' });
        doc.setFontSize(10);
        doc.text(data.description, xOffset, 150, { align: 'center' });

        // Headers
        var columns: RowInput[] = [
            [{ content: 'Répondez aux questions suivantes par OUI ou par NON*', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255] } },
            { content: 'OUI', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom' } },
            { content: 'NON', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom' } }]
        ];

        // Rows
        const rows: RowInput[] = [];
        data.questionGroups.forEach(g => {
            rows.push([{ content: g.title, colSpan: 3, styles: { halign: 'center', textColor: [255, 255, 255], fillColor: [192, 32, 38] } }]);
            g.items.forEach(i => {
                rows.push([
                    i.question,
                    { content: i.answer ? 'X' : ' ', styles: { halign: 'center', cellWidth: chkWidth } },
                    { content: !i.answer ? 'X' : ' ', styles: { halign: 'center', cellWidth: chkWidth } }]);
            });
        });
        rows.push([{
            content: 'NB*: Les réponses formulées relèvent de la seule responsabilité du licencié.', colSpan: 3, styles: {
                halign: 'center',
                textColor: this.tableLineColor,
                fontStyle: 'italic',
                fontSize: 8
            }
        }]);

        // Table
        autoTable(doc, {
            tableLineColor: this.tableLineColor,
            tableLineWidth: 0.75,
            theme: this.theme,
            head: columns,
            body: rows,
            startY: 250,
            didDrawCell: (data) => {
                if (data.section === 'body') {
                    // Dessin des checkboxes
                    if ((data.column.index === 1 || data.column.index === 2) && !data.cell.text.includes('')) {
                        data.cell.styles.font = 'courrier';
                        data.cell.styles.halign = 'center';
                        this.drawCheckbox(doc, data.cell.x + x, data.cell.y + y);
                    }
                }
            }
        });
        doc.save(filename);
    }

    private buildHealthFormMinor(data: Questionary, filename: string) {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });
        let x = 15, y = 5, w = 10, chkWidth = 40;

        // Logo and Title
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 40, 40);
        const xOffset = (doc.internal.pageSize.width / 2);
        doc.text(data.title, xOffset, 20, { align: 'center' });
        let startX = 100, startY = 25;

        doc.setFontSize(10);
        doc.text('Fille', startX, startY + w + 3);
        startX += 10;
        doc.line(startX + x, startY + y, startX + x + w, startY + y);
        doc.line(startX + x + w, startY + y, startX + x + w, startY + y + w);
        doc.line(startX + x + w, startY + y + w, startX + x, startY + y + w);
        doc.line(startX + x, startY + y + w, startX + x, startY + y);
        if (data.genre === 'F') {
            doc.text('X', startX + x + 2, startY + w + 3);
        }

        startX += 40;
        doc.text('Garçon', startX, startY + w + 3);
        startX += 23;
        doc.line(startX + x, startY + y, startX + x + w, startY + y);
        doc.line(startX + x + w, startY + y, startX + x + w, startY + y + w);
        doc.line(startX + x + w, startY + y + w, startX + x, startY + y + w);
        doc.line(startX + x, startY + y + w, startX + x, startY + y);
        if (data.genre === 'M') {
            doc.text('X', startX + x + 2, startY + w + 3);
        }

        startX += 50;
        doc.text('NOM :', startX, startY + w + 3);
        startX += 33;
        doc.text(data.nom, startX, startY + w + 3);

        startX += 80;
        doc.text('PRENOM :', startX, startY + w + 3);
        startX += 55;
        doc.text(data.prenom, startX, startY + w + 3);

        startX += 80;
        doc.text('AGE :', startX, startY + w + 3);
        startX += 30;
        doc.text(data.age.toString(), startX, startY + w + 3);

        // Headers
        var columns: RowInput[] = [
            [{ content: data.description, styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255] } },
            { content: 'OUI', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom' } },
            { content: 'NON', styles: { textColor: [0, 0, 0], fillColor: [255, 255, 255], valign: 'bottom' } }]
        ];

        // Rows
        const rows: RowInput[] = [];
        data.questionGroups.forEach(g => {
            rows.push([{ content: g.title, colSpan: 3, styles: { halign: 'center', textColor: [255, 255, 255], fillColor: [192, 32, 38] } }]);
            g.items.forEach(i => {
                rows.push([
                    i.question,
                    { content: i.answer ? 'X' : ' ', styles: { halign: 'center', cellWidth: chkWidth } },
                    { content: !i.answer ? 'X' : ' ', styles: { halign: 'center', cellWidth: chkWidth } }]);
            });
        });

        // Table
        autoTable(doc, {
            tableLineColor: this.tableLineColor,
            tableLineWidth: 0.75,
            theme: this.theme,
            head: columns,
            body: rows,
            startY: 45,
            didDrawCell: (data) => {
                if (data.section === 'body') {
                    // Dessin des checkboxes
                    if ((data.column.index === 1 || data.column.index === 2) && !data.cell.text.includes('')) {
                        data.cell.styles.font = 'courrier';
                        data.cell.styles.halign = 'center';
                        this.drawCheckbox(doc, data.cell.x + x, data.cell.y + y);
                    }
                }
            },
            // willDrawCell: (data) => {
            //     if (data.column.index === 0 && data.row.cells.length === 1) {
            //         doc.setTextColor(41, 128, 186);
            //         doc.setFillColor(51, 51, 51);
            //         doc.setFont('helvetica', 'bold');
            //         data.cell.styles.halign = 'center';
            //         //data.row.cells[0].colSpan = 3;
            //     }
            // },
            // didParseCell: (data) => {
            //     if (data.column.index === 0 && data.row.cells[1].text.includes('')) {
            //         data.cell.colSpan = 3;
            //     }
            // },
        });
        doc.save(filename);
    }

    private drawCheckbox(doc: jsPDF, x: number, y: number, w: number = 10) {
        doc.line(x, y, x + w, y);
        doc.line(x + w, y, x + w, y + w);
        doc.line(x + w, y + w, x, y + w);
        doc.line(x, y + w, x, y);
    }

    private buildEndHealthFormMajor(data: Questionary): Blob {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });

        // Logos and Title
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);
        doc.addImage('assets/images/logos/rf.png', 'JPEG', doc.internal.pageSize.width - 109, 10, 75, 50);

        let xOffset = (doc.internal.pageSize.width / 2);
        let text = 'DOCUMENT REMIS AU RESPONSABLE DE L\'ASSOCIATION';
        doc.text(text, xOffset, 120, { align: 'center' });
        const textWidth = doc.getTextWidth(text);
        doc.line(xOffset - (textWidth / 2), 130, xOffset + (textWidth / 2), 130);

        xOffset = 34;
        let yOffset = 150;
        doc.setFontSize(10);

        text = 'Attestation en vue du renouvellement de ma licence sportive relatif au « QS-SPORT » à compter du 4 Mars 2022*';
        doc.text(text, xOffset, yOffset);

        yOffset += 200;
        const birthdayDate = data.birthdayDate ? ', né(e) le ' + this.datePipe.transform(data.birthdayDate, 'dd/MM/yyyy') + ', ' : ' ';
        text = `Dans le cadre de la demande de renouvellement de ma licence auprès de l'UNSLL, je soussigné(e) 
${data.nom} ${data.prenom}${birthdayDate}atteste avoir renseigné et avoir répondu par la négative 
à l'ensemble des questions du questionnaire de santé.`;
        doc.text(text, xOffset, yOffset);
        
        yOffset += 60;
        text = `Saison 2023-2024, Club Loisir Léo Lagrange`;
        doc.text(text, xOffset, yOffset);

        // yOffset += 60;
        // text = `Conformément aux dispositions de l'article D. 231-1-4 du Code du Sport :`;
        // doc.text(text, xOffset, yOffset);

//         yOffset += 20;
//         this.drawCheckbox(doc, xOffset, yOffset);
//         doc.text('X', 36, yOffset + 9);

//         text = `J'ai répondu NON à chacune des rubriques du questionnaire. Dans ce cas, la présente attestation sera fournie à  
// l'association au sein de laquelle je sollicite le renouvellement de ma licence.`;
//         doc.text(text, xOffset + 20, yOffset + 5);

        yOffset += 30;
        text = `Fait pour servir et valoir ce que de droit.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 30;
        text = `Fait à ${data.commune}, le ${data.date}`;
        doc.text(text, xOffset, yOffset);

        yOffset += 20;
        text = `Signature`;
        doc.addImage(data.signature, 50, yOffset, 300, 150);

        return new Blob([doc.output('blob')], { type: 'application/pdf' });
    }

    private buildEndHealthFormMinor(data: Questionary): Blob {
        const doc = new jsPDF({
            orientation: "p", //set orientation
            unit: "pt", //set unit for document
            format: "letter" //set document standard
        });

        // Logos and Title
        doc.addImage('assets/images/logos/logo-CLLL.png', 'JPEG', 34, 2, 67, 63);
        doc.addImage('assets/images/logos/rf.png', 'JPEG', doc.internal.pageSize.width - 109, 10, 75, 50);

        let xOffset = (doc.internal.pageSize.width / 2);
        let text = 'DOCUMENT REMIS AU RESPONSABLE DE L\'ASSOCIATION';
        doc.text(text, xOffset, 120, { align: 'center' });
        const textWidth = doc.getTextWidth(text);
        doc.line(xOffset - (textWidth / 2), 130, xOffset + (textWidth / 2), 130);

        xOffset = 34;
        let yOffset = 250;
        doc.setFontSize(10);

        this.drawCheckbox(doc, xOffset, yOffset);
        doc.text('X', 36, yOffset + 9);

        text = `Mon enfant, ${data.nom} ${data.prenom}, et moi-même avons répondu NON à chacune des rubriques du questionnaire. `;
        doc.text(text, xOffset + 20, yOffset + 8);

        yOffset += 50;
        text = `Nom du représentant légal : ${data.tuteur}`;
        doc.text(text, xOffset, yOffset);

        yOffset += 50;
        text = `Fait à ${data.commune}, le ${data.date}`;
        doc.text(text, xOffset, yOffset);

        yOffset += 20;
        text = `Signature`;
        doc.addImage(data.signature, 50, yOffset, 300, 150);

        return new Blob([doc.output('blob')], { type: 'application/pdf' });
    }

    private captureHTML(item: HTMLElement): Promise<string> {
        const dates = item.querySelectorAll('input');
        dates.forEach(d => {
            if (d.className.includes('error')) {
                d.className = d.className.replace(' error', '');
            }
            if (d.type !== 'radio') {
                let v = (d as HTMLInputElement).value;
                const label = d.className.includes('telephone') ? 'Fixe: ' : (d.className.includes('mobile') ? 'Mobile: ' : '');
                if (d.type === 'date') {
                    v = this.datePipe.transform(v, 'dd/MM/yyyy', 'fr-FR');
                }
                if (v) {
                    d.insertAdjacentText('afterend', ' ' + label + v);
                }

                d.remove();
            }

        });

        return domtoimage.toPng(item, {
            bgcolor: '#fff',
            width: item.clientWidth * this.scale,
            height: item.clientHeight * this.scale,
            style: {
                transform: 'scale(' + this.scale + ')',
                transformOrigin: 'top left'
            }
        }).then(dataUrl => {
            return dataUrl;
        }).catch(err => {
            throw err;
        });
    }

    private buildPdf(base64: string, footer: PdfFooter): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const doc = new jsPDF("p", "pt", "a4", true);
                const imgWidth = img.naturalWidth * this.ratio / this.scale;
                const imgHeight = img.naturalHeight * this.ratio / this.scale;
                doc.addImage(base64, 25, 50, imgWidth, imgHeight, null, 'SLOW');
                if (footer) {
                    doc.setFontSize(7);
                    doc.text(footer.text, 25, 826, {});
                }
                const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
                resolve(blob);
            };
            img.onerror = (err) => {
                reject('error building pdf: ' + JSON.stringify(err));
            }
            img.src = base64;
        });
    }

    private getFooter(item: HTMLElement, orientation: string): PdfFooter {
        const footer = (item.querySelector('.footer') as HTMLDivElement);
        if (footer) {
            const h = getComputedStyle(footer, null).getPropertyValue('height');
            console.log('footer height: ', h);
            const top = this.px2pt(h, orientation);
            console.log('top: ', top);
            const text = footer.innerText;
            footer.remove();
            return {
                text: text,
                top: top
            };
        }
        return null;
    }

    private px2pt(px: string, orientation: string): number {
        if (px) {
            if (px.endsWith('px')) {
                px = px.replace('px', '');
            }
            const h = Number(px);
            return (orientation === 'p' ? this.heightP : this.heightL) - (h * 72 / 96);
        }
        return orientation === 'p' ? this.heightP : this.heightL;
    }
}

import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import domtoimage from 'dom-to-image';
import { HttpDataService } from './http-data.service';

import jsPDF, { TextOptionsLight } from 'jspdf';
import autoTable, { Color, ThemeType } from 'jspdf-autotable';
import { PdfFooter } from '../models/pdf-footer.model';
import { DatePipe } from '@angular/common';
import { Questionary } from '../models/questionary.model';
import { RowInput } from 'jspdf-autotable';
import { ParentAuth } from '../models/parent-auth.model';
import { AdherentDoc } from '../models/adherent-doc.model';
import { Adherent } from '../models/adherent.model';

@Injectable()
export class PdfMakerService {
    heightP: number = 826;
    heightL: number = 826;
    scale = 2;
    ratio = 0.75292857248934;
    theme: ThemeType = 'grid';
    tableLineColor: Color = [189, 195, 199];
    constructor(
        private datePipe: DatePipe,
        private http: HttpDataService<any>) {

    }

    buildAndSendPdf(id: string, name: string, item: HTMLElement): Promise<string> {
        return new Promise((resolve, reject) => {
            const footer = this.getFooter(item, 'p');
            this.captureHTML(item).then(base64 => {
                this.buildPdf(base64, footer).then((blob) => {
                    const formData = this.getFormData(id, name, blob);
                    this.sendPdf(formData).then((file) => {
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

    sendDocuments(id: string, docs: AdherentDoc[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const fd = this.getFormDataMultiple(id, docs);
            this.sendDocs(fd).then((result) => {
                resolve(result);
            })
                .catch(err => {
                    reject('error sending documents: ' + JSON.stringify(err));
                });
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

    buildAdherentForm(data: Adherent): Promise<Blob> {
        return new Promise((resolve) => {
            try {
                const blob: Blob = this.buildAdherentFormBlob(data);
                resolve(blob);
            } catch(err) {
                resolve(null);
            }
        });
    }

    private buildAdherentFormBlob(data: Adherent): Blob {
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
        doc.text(data.Genre, xOffset + 70, yOffset);

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
        text = `Personne à prévenir en cas d\'urgence : `;
        doc.setFont('helvetica', 'bold');
        doc.text(text, xOffset, yOffset, { align: 'center' });

        // Gauche
        xOffset = 34;
        yOffset += 20;
        doc.setFont('helvetica', 'bold');
        text = 'Nom : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.AlertLastName, xOffset + 70, yOffset);

        // Centre
        xOffset = 200; 
        doc.setFont('helvetica', 'bold');
        text = 'Prénom : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.AlertFirstName, xOffset + 50, yOffset);

        // Droite
        xOffset = 350;
        doc.setFont('helvetica', 'bold');
        text = 'Téléphone : ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text(data.AlertPhone, xOffset + 70, yOffset);

        // Autres membres
        xOffset = 34;
        yOffset += 40;
        doc.setFont('helvetica', 'bold');
        text = 'Autres membres, ';
        doc.text(text, xOffset, yOffset);
        doc.setFont('helvetica', 'normal');
        doc.text('si adhésion multiple, conjoints et descendants mineurs : ', xOffset + 85, yOffset);

        yOffset += 20;
        if (data.Membres?.length) {

        } else {
            doc.text('Aucun membre', xOffset, yOffset);
        }


        doc.save('adhesion.pdf');

        return new Blob([doc.output('blob')], { type: 'application/pdf' });
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
        text = `Les responsables dégagent leur responsabilité dès la sortie des enfants du gymnase.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 100;
        text = `Fait à ${data.commune}, le ${data.date}`;
        doc.text(text, xOffset, yOffset);

        yOffset += 30;
        text = `Signature`;
        doc.text(text, xOffset, yOffset);

        doc.addImage(data.signature, 50, yOffset, 300, 150);
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

        text = 'Attestation en vue du renouvellement de ma licence sportive relatif au « QS-SPORT » à compter du 1er juillet 2017*';
        doc.text(text, xOffset, yOffset);

        yOffset += 200;
        text = `Dans le cadre de la demande de renouvellement de ma licence auprès de l'UNSLL, je soussigné(e) 
${data.nom} ${data.prenom} atteste avoir rempli le questionnaire de santé fixé par arrêté du ministre chargé des sports 
daté du 20 Avril 2017.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 60;
        text = `Conformément aux dispositions de l'article D. 231-1-4 du Code du Sport :`;
        doc.text(text, xOffset, yOffset);

        yOffset += 20;
        this.drawCheckbox(doc, xOffset, yOffset);
        doc.text('X', 36, yOffset + 9);

        text = `J'ai répondu NON à chacune des rubriques du questionnaire. Dans ce cas, la présente attestation sera fournie à  
l'association au sein de laquelle je sollicite le renouvellement de ma licence.`;
        doc.text(text, xOffset + 20, yOffset + 5);

        yOffset += 150;
        text = `Fait pour servir et valoir ce que de droit.`;
        doc.text(text, xOffset, yOffset);

        yOffset += 20;
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

    private getFormData(id: string, name: string, blob: Blob): FormData {
        var formData = new FormData();
        formData.append('filename', name);
        formData.append('id', id);
        formData.append(name, blob, name);
        return formData;
    }

    private getFormDataMultiple(id: string, files: AdherentDoc[]): FormData {
        var formData = new FormData();
        formData.append('id', id);
        files.forEach(file => {
            formData.append(file.filename, file.blob, file.filename);
        });
        return formData;
    }

    private async sendPdf(data: FormData): Promise<string> {
        return this.http.post<FormData>(environment.apiUrl + 'Document/SavePDF', data, { responseType: 'text' });
    }

    private async sendDocs(data: FormData): Promise<boolean> {
        return this.http.post<FormData>(environment.apiUrl + 'Document/SaveDocuments', data, { responseType: 'text' });
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
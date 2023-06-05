import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Adherent } from '@app/core/models/adherent.model';
import { ThemeService } from '@app/core/services/theme.service';
import { CartItem } from '@app/inscription/models/cart-item.model';
import { Cart } from '@app/inscription/models/cart.model';
import { MemberRemove } from '@app/inscription/models/member-remove.model';
import { StartInscription } from '@app/inscription/models/start-inscription.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { LayoutService } from '@app/ui/layout/services/layout.service';
import { environment } from '@env/environment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { LoaderService } from '@app/ui/layout/services/loader.service';
import { HelloAssoService } from '@app/inscription/services/helloasso.service';
import { AdherentService } from '@app/core/services/adherent.service';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { ModalService } from '@app/ui/layout/services/modal.service';

@Component({
    selector: 'app-inscription-page',
    templateUrl: './inscription-page.component.html',
    styleUrls: ['./inscription-page.component.scss']
})
export class InscriptionPageComponent implements OnInit {
    title: string;
    title2: string = environment.assoTitle;
    step = 1;
    reinscription: boolean = environment.reinscription;
    public isMobile = false;
    private scrollPos = 0;
    otherSections: string[] = [];
    paymentStatus: string;
    paymentCode: string;
    paymentId: string;
    paymentError: string;
    paymentPrintUrl: string;
    adherent: Adherent;
    isDarkTheme: boolean;
    isMenuOpened: boolean;
    cart: Cart;
    startIns: StartInscription;
    asso = environment.asso;
    docurl = environment.urlassodocs;
    notifier = new Subject<void>();
    subModal: Subscription;
    redirectUrl = 'https://www.helloasso-sandbox.com/associations/clll-colomiers-volley-ball/checkout/edbd162482a640d1ac05710a05943f38';

    constructor(
        private inscriptionService: InscriptionService,
        private adherentService: AdherentService,
        private pdf: PdfMakerService,
        private themeService: ThemeService,
        private location: Location,
        private layoutService: LayoutService,
        private loader: LoaderService,
        private route: ActivatedRoute,
        private helloasso: HelloAssoService,
        private authService: AuthorizeApiService,
        private modalService: ModalService,
        private router: Router) {
        if (window.matchMedia('(max-width: 1025px)').matches) {
            this.isMobile = true;
        }
        //this.authService.AuthorizeAnonymous();
        this.themeService.isDarkTheme.subscribe(isDark => {
            this.isDarkTheme = isDark;
        })
        this.layoutService.obsMenuOpened.subscribe(isOpened => {
            this.isMenuOpened = isOpened;
        });
        let url = environment.fullApp ? '/' : '/inscription';
        this.route.queryParams.subscribe(params => {
            this.step = Number(params.step) || 1;
            this.paymentStatus = params.payment || null;
            if (this.paymentStatus) {
                this.adherent = this.getAdherentFromLocalstorage();
                this.cart = JSON.parse(localStorage.getItem('cart'));
                if (this.paymentStatus === 'cancel') {
                    this.step = 4;
                } else {
                    this.paymentCode = params.code || null;
                    this.paymentId = params.checkoutIntentId || null;
                    this.paymentError = params.error || null;
                    if (this.paymentCode === 'succeeded') {
                        console.log('payment succeeded - ', this.paymentId, this.paymentError);
                        this.getPaymentDoc(this.paymentId).then(url => {
                            if (url) {
                                this.paymentPrintUrl = url;
                            }
                        });
                        // Ecriture de l'adhérent en base
                        console.log('Ecriture de l\'adhérent en base: ', this.adherent);
                        this.addOrUpdate();
                    } else if (this.paymentCode === 'refused') {
                        console.log('payment refused - ', this.paymentId, this.paymentError);
                    }
                    this.step = 5;

                }
                this.location.replaceState(url);
            }
            if (this.step === 1) {
                this.init();
                this.location.replaceState(url);
            }
        });
    }

    ngOnInit(): void {

    }

    private getAdherentFromLocalstorage(): Adherent {
        const adherent = JSON.parse(localStorage.getItem('adherent'));
        if (adherent && adherent.BirthdayDate) {
            adherent.BirthdayDate = new Date(adherent.BirthdayDate);
        } 
        return adherent;
    }

    init() {
        this.step = 1;
        localStorage.removeItem('adherent');
        localStorage.removeItem('cart');
        const y = new Date().getFullYear();
        this.title = `Bulletin d\'adhésion ${y}-${y + 1}`;
        this.startIns = {
            local: true,
            already: false,
            nom: null,
            prenom: null,
            section: null,
            found: null
        };
    }

    addOrUpdate() {
        this.adherentService.addOrUpdate(this.adherent).then(result => {
            console.log('success addOrUpdate: ', result);
        })
            .catch(err => {
                console.log('error addOrUpdate: ', err);
            });
    }

    getPaymentDoc(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.helloasso.getCheckoutIntent(id).then(result => {
                if (result) {
                    const payments = result.order?.payments;
                    if (payments?.length) {
                        const url = payments[0].paymentReceiptUrl;
                        if (url) {
                            console.log('attestation url: ', url);
                            resolve(url);
                        }
                    }
                }
                console.log('suuccess: ', result);
            }).catch(err => {
                console.log('error: ', err)
                reject(err);
            });
        });

    }

    onAdherentChange(adherent: Adherent) {
        this.setCategTarifs(adherent);
    }

    // onAddMemberFromCart() {
    //     this.inscriptionService.obsAddMember.next(true);
    // }

    onStep1Validate(info: StartInscription) {
        this.cart = new Cart();
        if (this.reinscription && info.found) {
            this.adherent = new Adherent(info.found, info.local ? environment.postalcode : null);
        } else {
            this.adherent = new Adherent(null, info.local ? environment.postalcode : null);
        }
        if (info) {
            this.startIns = info;
            const already = info.nom !== null && info.prenom !== null && this.startIns.section !== null;
            
            if (already) {
                this.adherent.VerifC3L = 'Un autre membre, ' + info.prenom + ' ' + info.nom + ' est déjà inscrit en ' + this.startIns.section;
            } else if (this.startIns.section) {
                this.adherent.VerifC3L = 'L\'adhérent est déjà inscrit en ' + this.startIns.section;
            }
            this.adherent.Sections = this.inscriptionService.sections.filter(s => s === environment.section);
            const montant = this.startIns.already ? 0 : (already ? environment.tarifs.member : (info.local ? environment.tarifs.local : environment.tarifs.exterior));
            this.cart.addItem({
                type: 'adhesion',
                libelle: 'Adhésion ' + environment.asso,
                montant: montant,
                user: [this.adherent.Uid]
            });
            if (this.adherent.Category) {
                const item = this.getCartItemByCategory(this.adherent.Category, 'categorie', this.adherent.Uid);
                this.cart.addItem(item);
            }
            this.cart.setClient(this.adherent);
            this.step++;
        } else {
            console.log('no info provided by step 1');
        }
        console.log('adherent: ', this.adherent);
    }

    onCancel() {
        if (this.step === 2) {
            this.adherent = null;
        }
        this.step--;
    }

    onStep2Validate(adherent: Adherent) {
        this.adherent = adherent;
        this.showPopupAdd();
    }

    showPopupAdd() {
        if (this.subModal) {
            this.subModal.unsubscribe();
        }
        this.modalService.open({
            title: 'Ajouter un membre',
            validateLabel: 'Oui',
            cancelLabel: 'Non',
            showCancel: true,
            showValidate: true,
            size: {
                width: '100%',
                height: '240px'
            },
            component: 'popup-add',
            data: null
        });
        this.subModal = this.modalService.returnData
            .pipe(takeUntil(this.notifier))
            .subscribe(result => {
                if (result && this.modalService.modalShown.value.component === 'popup-add') {
                    if (result.data) {
                        this.onAddMember();
                    } else {
                        this.inscriptionService.setAdherent(this.adherent);
                        this.cart.setClient(this.adherent);
                        this.step++;
                        console.log('adherent: ', this.adherent);
                    }
                    this.notifier.next();
                    this.notifier.complete();
                }
            });
    }

    onAddMember() {
        const member = new Adherent(this.adherent, null, true);
        member.Sections = this.inscriptionService.sections.filter(s => s === environment.section);
        this.adherent.Membres.push(member);
        console.log('add member in inscription: ', this.adherent);
        this.cart.addItem({
            type: 'membre',
            libelle: 'Membre',
            montant: environment.tarifs.member,
            user: [this.adherent.Membres[this.adherent.Membres.length - 1].Uid]
        });
        this.setCategTarifs(this.adherent);
        this.inscriptionService.obsAddMember.next(member);
    }

    onRemoveMember(uid: string) {
        if (uid && this.adherent.Membres?.length && this.adherent.Membres.findIndex(m => m.Uid === uid) >= 0) {
            this.adherent.Membres = this.adherent.Membres.filter(m => m.Uid !== uid);
        }
        console.log('remove member in inscription: ', uid);
        //this.adherent = removed.adherent;
        this.cart.removeItem(uid);
    }

    onStep3Validate(adherent: Adherent) {
        console.log('Go to Payment');
        console.log('adherent: ', adherent);
        console.log('cart: ', this.cart);
        this.sendDocuments(adherent).then(() => {
            localStorage.setItem('adherent', JSON.stringify(adherent));
            this.step++;
        });
    }

    sendDocuments(adherent: Adherent): Promise<void> {
        return new Promise((resolve, reject) => {
            if (adherent.Documents?.length && adherent.Documents.filter(d => !d.sent).length) {
                this.loader.setLoading(true);
                this.pdf.sendDocuments(adherent.Uid, adherent.Documents).then(result => {
                    adherent.Documents.forEach(doc => {
                        doc.sent = result;
                    });
                    resolve();
                })
                    .catch(err => {
                        console.log('error sending documents: ', err);
                    })
                    .finally(() => {
                        this.loader.setLoading(false);
                    });
            } else {
                resolve();
            }
        });
    }

    onStep3Cancel(adherent: Adherent) {
        this.adherent = adherent;
        this.step--;
    }

    setStep(step: number) {
        this.step = step;
    }

    onSubmit() {

    }

    private getCartItemByCategory(categ: string, type: string, user: string): CartItem {
        return {
            type: type,
            libelle: categ === 'C' ? 'Adultes avec Licence FSGT' : (categ === 'L' ? 'Adultes en loisirs détente' : 'Ados 13/17 ans avec licence FSGT'),
            montant: categ === 'C' ? environment.tarifs.license : (categ === 'L' ? environment.tarifs.loisir : environment.tarifs.ado),
            user: [user]
        }
    }

    private setCategTarifs(adherent: Adherent) {
        if (adherent && adherent.Uid) {
            let item: CartItem;
            if (adherent.Category) {
                item = this.getCartItemByCategory(adherent.Category, 'categorie', adherent.Uid);
                this.cart.addItem(item);
            }
            adherent.Membres.forEach(member => {
                if (member.Category) {
                    item = this.getCartItemByCategory(member.Category, 'categorie', member.Uid);
                    this.cart.addItem(item);
                }
            });
        }
    }
}

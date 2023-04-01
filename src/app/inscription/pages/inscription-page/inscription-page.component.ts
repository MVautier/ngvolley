import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, QueryParamsHandling, Router } from '@angular/router';
import { HelloAssoService } from '@app/inscription/services/helloasso.service';
import { Adherent } from '@app/core/models/adherent.model';
import { ThemeService } from '@app/core/services/theme.service';
import { CartItem } from '@app/inscription/models/cart-item.model';
import { Cart } from '@app/inscription/models/cart.model';
import { MemberRemove } from '@app/inscription/models/member-remove.model';
import { StartInscription } from '@app/inscription/models/start-inscription.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { LayoutService } from '@app/ui/layout/services/layout.service';
import { environment } from '@env/environment';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-inscription-page',
    templateUrl: './inscription-page.component.html',
    styleUrls: ['./inscription-page.component.scss']
})
export class InscriptionPageComponent implements OnInit {
    title: string;
    otherSections: string[] = [];
    title2: string = environment.assoTitle;
    step = 1;
    paymentStatus: string;
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
        private helloasso: HelloAssoService,
        private modalService: ModalService,
        private themeService: ThemeService,
        private location: Location,
        private layoutService: LayoutService,
        private route: ActivatedRoute,
        private router: Router) {
        this.themeService.isDarkTheme.subscribe(isDark => {
            this.isDarkTheme = isDark;
        })
        this.layoutService.obsMenuOpened.subscribe(isOpened => {
            this.isMenuOpened = isOpened;
        });
        this.route.queryParams.subscribe(params => {
            this.step = Number(params.step) || 1;
            this.paymentStatus = params.payment || null;
            if (this.paymentStatus) {
                this.adherent = JSON.parse(localStorage.getItem('adherent'));
                this.cart = JSON.parse(localStorage.getItem('cart'));
                if (this.paymentStatus === 'cancel') {
                    this.step = 4;
                } else {
                    this.step = 5;
                }
                this.location.replaceState('/inscription');
            }
            if (this.step === 1) {
                this.init();
                this.location.replaceState('/inscription');
            }
        });
    }

    ngOnInit(): void {
        //window['_fs_namespace'] = 'FS';
        
        //this.init();
    }

    init() {
        this.step = 1;
        localStorage.removeItem('adherent');
        localStorage.removeItem('cart');
        const y = new Date().getFullYear();
        this.title = `Bulletin d\'adhésion ${y}-${y + 1}`;
        this.startIns = {
            local: true
        };
    }

    onAdherentChange(adherent: Adherent) {
        this.setCategTarifs(adherent);
    }

    onAddMemberFromCart() {
        this.inscriptionService.obsAddMember.next(true);
    }

    onAddMember(adherent: Adherent) {
        console.log('add member in inscription: ', adherent);
        this.adherent = adherent;
        this.cart.addItem({
            type: 'membre',
            libelle: 'Membre',
            montant: environment.tarifs.member,
            user: [this.adherent.Membres[this.adherent.Membres.length - 1].Uid]
        });
        this.setCategTarifs(adherent);
        this.inscriptionService.obsAddMember.next(false);
    }

    onRemoveMember(removed: MemberRemove) {
        console.log('remove member in inscription: ', removed);
        this.adherent = removed.adherent;
        this.cart.removeItem(removed.user);
    }

    onStep1Validate(info: StartInscription) {
        this.cart = new Cart();
        this.adherent = new Adherent(null, info.local ? environment.postalcode : null);
        if (info) {
            this.startIns = info;
            const already = info.nom !== null && info.prenom !== null && info.section !== null;
            if (already) {
                this.adherent.MainSectionInfo = info.prenom + ' ' + info.nom + ': ' + info.section;
            }
            this.adherent.Sections = this.inscriptionService.sections.filter(s => s === environment.section);
            const montant = already ? environment.tarifs.member : (info.local ? environment.tarifs.local : environment.tarifs.exterior);
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

    onStep2Validate(adherent: Adherent) {
        if (this.step === 2) {
            this.adherent = adherent;
        }
        if (this.step === 3) {
            this.adherent.Membres.push(adherent);
        }
        this.inscriptionService.setAdherent(this.adherent);
        this.cart.setClient(this.adherent);
        this.step++;
        console.log('adherent: ', adherent);
    }

    onStep3Validate(adherent: Adherent) {
        console.log('Go to Payment');
        console.log('adherent: ', adherent);
        console.log('cart: ', this.cart);
        localStorage.setItem('adherent', JSON.stringify(adherent));
        this.step++;
    }

    onStep3Cancel(adherent: Adherent) {
        this.adherent = adherent;
        this.step--;
    }

    onCancel() {
        if (this.step === 2) {
            this.adherent = null;
            this.startIns = {
                local: true
            };
        }
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

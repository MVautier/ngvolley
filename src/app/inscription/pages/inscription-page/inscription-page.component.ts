import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Adherent } from '@app/core/models/adherent.model';
import { ThemeService } from '@app/core/services/theme.service';
import { CartItem } from '@app/inscription/models/cart-item.model';
import { Cart } from '@app/inscription/models/cart.model';
import { MemberRemove } from '@app/inscription/models/member-remove.model';
import { StartInscription } from '@app/inscription/models/start-inscription.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { LayoutService } from '@app/ui/layout/services/layout.service';
import { environment } from '@env/environment';
import { filter } from 'rxjs';

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
  adherent: Adherent;
  isDarkTheme: boolean;
  isMenuOpened: boolean;
  cart: Cart;
  startIns: StartInscription;
  asso = environment.asso;
  docurl = environment.urlassodocs;

  constructor(
    private inscriptionService: InscriptionService,
    private themeService: ThemeService,
    private layoutService: LayoutService,
    private router: Router) { 
      this.themeService.isDarkTheme.subscribe(isDark => {
        this.isDarkTheme = isDark;
      })
      this.layoutService.obsMenuOpened.subscribe(isOpened => {
        this.isMenuOpened = isOpened;
      });
    }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
          if (event.url.endsWith('step=1')) {
            this.init();
            this.router.navigate(['inscription']);
          }
      });
      this.init();
  }

  init() {
    this.step = 1;
    const y = new Date().getFullYear();
    this.title = `Bulletin d\'adhésion ${y}-${y + 1}`; 
    this.startIns = {
      local: true
    };
  }

  onStep1Validate(info: StartInscription) {
    this.cart = new Cart();
    this.adherent = new Adherent(info.local ? environment.postalcode : null);
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
      this.step++;
    } else {
      console.log('no info provided by step 1');
    }
    console.log('adherent: ', this.adherent);
  }

  onAdherentChange(adherent: Adherent) {
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

  getCartItemByCategory(categ: string, type: string, user: string): CartItem {
    return {
      type: type,
      libelle: categ === 'C' ? 'Adultes avec Licence FSGT' : (categ === 'L' ? 'Adultes en loisirs détente' : 'Ados 13/17 ans avec licence FSGT'),
      montant: categ === 'C' ? environment.tarifs.license : (categ === 'L' ? environment.tarifs.loisir : environment.tarifs.ado),
      user: [user]
    }
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
    this.inscriptionService.obsAddMember.next(false);
  } 

  onRemoveMember(removed: MemberRemove) {
    console.log('remove member in inscription: ', removed);
    this.adherent = removed.adherent;
    this.cart.removeItem(removed.user);
  }

  onStep2Validate(adherent: Adherent) {
    if (this.step === 2) {
      this.adherent = adherent;
    }
    if (this.step === 3) {
      this.adherent.Membres.push(adherent);
    }
    this.inscriptionService.setAdherent(this.adherent);
    this.step++;
    console.log('adherent: ', adherent);
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

  onStep3Cancel(adherent: Adherent) {
    this.adherent = adherent;
    this.step--;
  }

  setStep(step: number) {
    this.step = step;
  }

  onSubmit() {

  }
}

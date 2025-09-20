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
import { Order } from '@app/core/models/order.model';
import { UtilService } from '@app/core/services/util.service';

@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription-page.component.html',
  styleUrls: ['./inscription-page.component.scss']
})
export class InscriptionPageComponent implements OnInit {
  title: string;
  title2: string;
  step = 1;
  reinscription: boolean = environment.reinscription;
  inscriptionOpened: boolean = environment.inscriptionOpened;
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
  saison: number;
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
    private util: UtilService,
    private modalService: ModalService,
    private router: Router) {
    if (window.matchMedia('(max-width: 1025px)').matches) {
      this.isMobile = true;
    }
    //this.authService.AuthorizeAnonymous();
    this.themeService.isDarkTheme.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
    const manual = localStorage.getItem('manualFill');
    if (manual) {
      localStorage.removeItem('manualFill');
      this.inscriptionService.setManualFill(true);
    } else {
      this.inscriptionService.setManualFill(false);
    }
    console.log('manual mode: ', this.inscriptionService.getManualFill());
    this.layoutService.obsMenuOpened.subscribe(isOpened => {
      this.isMenuOpened = isOpened;
    });
    let url = environment.fullApp ? '/' : '/inscription';
    this.route.queryParams.subscribe(async params => {
      this.step = Number(params.step) || 1;
      this.paymentStatus = params.payment || null;
      if (this.paymentStatus) {
        this.saison = this.adherentService.obsSeason.value;
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
            const url = await this.getPaymentDoc(this.paymentId);
            if (url) {
              this.paymentPrintUrl = url;
            }
            // Ecriture de l'adhérent en base
            console.log('Ecriture de l\'adhérent en base: ', this.adherent);
            this.addOrUpdate(this.adherent, true);
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
    this.saison = this.adherentService.obsSeason.value;
    this.title = `Formulaire d\'inscription et de paiement en ligne au ${environment.assoTitle} pour la saison ${this.saison}-${this.saison + 1}`;
    this.title2 = 'Réservé aux adultes pour la compétition, l\'école de Volley et les adultes en loisir étant complets';
    this.startIns = {
      local: true,
      already: false,
      nom: null,
      prenom: null,
      already2: false,
      nom2: null,
      prenom2: null,
      section: null,
      found: null,
      lien: null
    };
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
        console.log('success getPaymentDoc : ', result);
      }).catch(err => {
        console.log('error getPaymentDoc : ', err);
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

  async onStep1Validate(info: StartInscription) {
    if (info.found) {
      if (info.found.Saison === this.saison) {
        this.showPopupError('Impossible de continuer', 'Vous êtes déjà inscrit(e) pour cette saison.');
        return;
      }
    }
    this.cart = new Cart();
    if (this.reinscription && info.found) {
      this.adherent = new Adherent(info.found, info.local ? environment.postalcode : null, null, this.saison);
    } else {
      this.adherent = new Adherent(info.found ?? null, info.local ? environment.postalcode : null, null, this.saison);
    }
    const checked = await this.inscriptionService.checkAdherent(null, this.adherent, 2);
    if (checked?.found) {
      this.adherent.Histo = checked.found.Histo;
      this.adherent.Orders = checked.found.Orders;
    }
    if (info) {
      this.startIns = info;
      const already = info.already && info.section !== null;
      const already2 = info.already2 && info.nom2 !== null && info.prenom2 !== null && info.lien != null && info.section !== null;

      if (already) {
        this.adherent.VerifC3L = 'L\'adhérent est déjà inscrit en ' + this.startIns.section;
      } else if (already2) {
        this.adherent.VerifC3L = 'Un autre membre, ' + info.prenom2 + ' ' + info.nom2 + ' en tant que ' + info.lien + ' est déjà inscrit en ' + this.startIns.section;
      }

      this.adherent.Sections = this.inscriptionService.sections.filter(s => s === environment.section);
      const montant = already ? 0 : (already2 ? environment.tarifs.member : (info.local ? environment.tarifs.local : environment.tarifs.exterior));
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

  async onStep2Validate(adherent: Adherent) {
    const found = await this.inscriptionService.getExistingAdherent(adherent);
    if (found) {
      if (found.Saison === this.saison) {
        this.showPopupError('Impossible de continuer', 'Vous êtes déjà inscrit(e) pour cette saison.');
        return;
      }
    }
    this.adherent = adherent;
    this.showPopupAdd();
  }

  showPopupError(title: string, content: string) {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
    this.modalService.open({
      title: title,
      validateLabel: 'Oui',
      cancelLabel: 'Fermer',
      showValidate: false,
      showCancel: true,
      size: {
        width: '100%',
        height: '200px'
      },
      component: 'popup-error',
      data: content
    });
    this.subModal = this.modalService.returnData
      .pipe(takeUntil(this.notifier))
      .subscribe(async result => {
        if (this.modalService.modalShown.value.component === 'popup-error') {
          this.notifier.next();
          this.notifier.complete();
        }
      });
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
      .subscribe(async result => {
        let message: string = '';
        let error = false;
        if (result && this.modalService.modalShown.value.component === 'popup-add') {
          if (result.data) {
            this.onAddMember();
          } else {
            if (this.adherent.Membres?.length) {
              this.adherent.Membres.forEach(async m => {
                const found = await this.inscriptionService.getExistingAdherent(m);
                if (found) {
                  if (found.Saison === this.saison) {
                    error = true;
                    message += `<br>Le membre ${m.FirstName} ${m.LastName} est déjà inscrit(e) pour cette saison`;
                  }
                }
              });
            }
            if (!error) {
              this.inscriptionService.setAdherent(this.adherent);
              this.cart.setClient(this.adherent);
              this.step++;
            }
          }
          this.notifier.next();
          this.notifier.complete();
          if (error) {
            if (this.subModal) {
              this.subModal.unsubscribe();
            }
            setTimeout(() => {
              this.showPopupError('Impossible de continuer', message);
            }, 500);
          }
        }
      });
  }

  onAddMember() {
    const member = new Adherent(this.adherent, null, true, this.saison);
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
    this.pdf.buildAdherentForm(adherent).then(blob => {
      const filename = `adhesion`;
      Adherent.addDoc(adherent, 'adhesion', filename + '.pdf', blob);
      if (adherent.Signature && !adherent.Signature.endsWith('.png')) {
        try {
          const b = this.util.dataURLtoBlob(adherent.Signature);
          const ext = this.util.mime2ext(adherent.Signature);
          if (b && ext) {
            Adherent.addDoc(adherent, 'signature', 'signature.' + ext, blob);
            adherent.Signature = adherent.Uid + '/' + 'signature.' + ext;
          }
        } catch (err) {
          console.log('error converting signature', err);
        }
      }
      console.log('adherent with docs : ', adherent);

    }).catch(err => {
      console.log('error generating adherent form: ', err);
    }).finally(() => {
      console.log('adherent: ', adherent);
      this.addOrUpdate(adherent, false).then((adh: Adherent) => {
        if (!adherent.IdAdherent || adherent.IdAdherent !== adh.IdAdherent) {
          adherent.IdAdherent = adh.IdAdherent;
        }
        adherent.Saved = adh.Saved;
        this.sendDocuments(adherent).then(() => {
          localStorage.setItem('adherent', JSON.stringify(adherent));
          this.step++;
        });
      });
    });
  }

  sendDocuments(adherent: Adherent): Promise<void> {
    return new Promise((resolve, reject) => {
      if (adherent.Documents?.length && adherent.Documents.filter(d => !d.sent).length) {
        this.loader.setLoading(true);
        this.pdf.sendAllDocuments(adherent).then(result => {
          adherent.Documents.forEach(doc => {
            doc.sent = result;
          });
          if (adherent.Membres.length) {
            adherent.Membres.forEach(m => {
              m.Documents.forEach(d => {
                d.sent = true;
              });
            });
          }
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

  addOrUpdate(adherent: Adherent, paymentCallback: boolean): Promise<Adherent> {
    return new Promise((resolve, reject) => {
      const membres: Adherent[] = [];
      const local = this.getAdherentFromLocalstorage();
      const already = local && local.Uid && this.adherent.Uid && local.Uid === this.adherent.Uid && local.Saved;
      if (!already || paymentCallback) {
        if (this.adherent.Membres?.length) {
          this.adherent.Membres.forEach(m => {
            const d = new Date(m.BirthdayDate);
            m.BirthdayDate = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
            membres.push(this.prepareAdherentForBdd(m, false, paymentCallback));
          });
        }
        const adherent = this.prepareAdherentForBdd(this.adherent, true, paymentCallback);
        adherent.Membres = membres;
        this.adherentService.addOrUpdate(adherent).then(result => {
          console.log('success addOrUpdate: ', result);
          result.Saved = true;
          resolve(result);
        })
          .catch(err => {
            console.log('error addOrUpdate: ', err);
            resolve(this.adherent);
          });
      } else {
        resolve(this.adherent);
      }
    });
  }

  prepareAdherentForBdd(adherent: Adherent, main = true, paymentCallback: boolean = true): Adherent {
    if (this.saison && paymentCallback && adherent.Saison !== this.saison) {
      adherent.Saison = this.saison;
    }
    const d = new Date(adherent.BirthdayDate);
    adherent.BirthdayDate = this.util.UtcDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    adherent.HealthStatementDate = adherent.Documents.find(d => d.type === 'attestation') ? this.util.UtcDate(new Date()) : null;
    adherent.Photo = adherent.Documents.find(d => d.type === 'photo') ? adherent.Uid + '/' + adherent.Documents.find(d => d.type === 'photo').filename : null;
    adherent.InscriptionDate = new Date();
    adherent.FirstName = adherent.FirstName ? adherent.FirstName.trim() : adherent.FirstName;
    adherent.LastName = adherent.LastName ? adherent.LastName.trim() : adherent.LastName;
    if (main) {
      adherent.Payment = paymentCallback ? 'Terminé' : 'En attente';
      const toCLLL = this.cart.items.filter(i => i.type === 'adhesion').map(i => i.montant).reduce((a, b) => a + b, 0);
      const client = this.cart.client;
      const order: Order = paymentCallback ? {
        Id: 0,
        IdPaiement: Number(this.paymentId),
        IdAdherent: adherent.IdAdherent,
        Saison: adherent.Saison,
        Date: this.util.UtcDate(new Date()),
        CotisationC3L: toCLLL,
        Total: this.cart.total,
        Nom: client?.LastName,
        Prenom: client?.FirstName,
        Email: client?.Email,
        DateNaissance: this.util.UtcDate(new Date(client?.BirthdayDate)),
        PaymentLink: this.paymentPrintUrl
      } : null;
      if (!adherent.Orders) {
        adherent.Orders = [];
      }
      if (order) {
        adherent.Orders.push(order);
      }
    }
    return adherent;
  }

  onStep3Cancel(adherent: Adherent) {
    if (adherent?.Uid) {
      this.adherent = adherent;
      this.step--;
    }
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
      console.log('Adherent Uid: ', adherent.Uid);
      console.log('Adherent Category: ', adherent.Category);
      if (adherent?.Membres.length) {
        adherent.Membres.forEach(m => {
          console.log('Member Uid: ', m.Uid);
          console.log('Member Category: ', m.Category);
        });
      }
      let item: CartItem;
      if (adherent.Category) {
        item = this.getCartItemByCategory(adherent.Category, 'categorie', adherent.Uid);
        if (adherent.OldUid && adherent.OldUid !== adherent.Uid) {
          this.cart.updateUid(adherent.OldUid, adherent.Uid);
        }
        this.cart.addItem(item);
      }
      adherent.Membres.forEach(member => {
        if (member.Category) {
          item = this.getCartItemByCategory(member.Category, 'categorie', member.Uid);
          if (member.OldUid && member.OldUid !== member.Uid) {
            this.cart.updateUid(member.OldUid, member.Uid);
          }
          this.cart.addItem(item);
        }
      });
    }
  }
}

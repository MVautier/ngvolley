import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';

import { InscriptionPageComponent } from './inscription-page.component';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { AdherentService } from '@app/core/services/adherent.service';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { ThemeService } from '@app/core/services/theme.service';
import { LayoutService } from '@app/ui/layout/services/layout.service';
import { LoaderService } from '@app/ui/layout/services/loader.service';
import { HelloAssoService } from '@app/inscription/services/helloasso.service';
import { AuthorizeApiService } from '@app/authentication/services/authorize-api.service';
import { UtilService } from '@app/core/services/util.service';
import { ModalService } from '@app/ui/layout/services/modal.service';

describe('InscriptionPageComponent', () => {
  let component: InscriptionPageComponent;
  let fixture: ComponentFixture<InscriptionPageComponent>;
  let adherentService: jasmine.SpyObj<AdherentService>;

  beforeEach(async () => {
    adherentService = jasmine.createSpyObj('AdherentService', ['getParams', 'addOrUpdate']);
    adherentService.getParams.and.resolveTo({} as any);
    (adherentService as any).obsSeason = new BehaviorSubject<number>(2026);

    await TestBed.configureTestingModule({
      declarations: [InscriptionPageComponent],
      providers: [
        { provide: InscriptionService, useValue: jasmine.createSpyObj('InscriptionService', ['setManualFill', 'getManualFill']) },
        { provide: AdherentService, useValue: adherentService },
        { provide: PdfMakerService, useValue: jasmine.createSpyObj('PdfMakerService', ['buildAdherentForm', 'sendAllDocuments']) },
        { provide: ThemeService, useValue: { isDarkTheme: new BehaviorSubject<boolean>(false) } },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['replaceState']) },
        { provide: LayoutService, useValue: { obsMenuOpened: new BehaviorSubject<boolean>(false) } },
        { provide: LoaderService, useValue: jasmine.createSpyObj('LoaderService', ['setLoading']) },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: HelloAssoService, useValue: jasmine.createSpyObj('HelloAssoService', ['sendCheckoutIntent', 'getCheckoutIntent']) },
        { provide: AuthorizeApiService, useValue: jasmine.createSpyObj('AuthorizeApiService', ['AuthorizeAnonymous']) },
        { provide: UtilService, useValue: new UtilService() },
        { provide: ModalService, useValue: jasmine.createSpyObj('ModalService', ['open'], { returnData: of(null), modalShown: new BehaviorSubject<any>(null) }) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InscriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('charge les paramètres admin (InscriptionOpened/Reinscription) au démarrage', () => {
    expect(adherentService.getParams).toHaveBeenCalled();
  });
});

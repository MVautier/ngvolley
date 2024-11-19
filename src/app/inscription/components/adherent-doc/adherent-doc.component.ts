import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { CheckAdherent } from '@app/inscription/models/check-adherent.model';
import { PdfMakerService } from '@app/core/services/pdf-maker.service';
import { ModalService } from '@app/ui/layout/services/modal.service';
import { Observable, Subject, Subscription, takeUntil, fromEvent } from 'rxjs';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { map } from 'rxjs/operators';
import { AdherentService } from '@app/core/services/adherent.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';
import { PdfInfo } from '@app/core/models/pdf-info.model';
import { ModalResult } from '@app/ui/layout/models/modal-result.model';
import { PhotoService } from '@app/inscription/services/photo.service';
import { Questionary } from '@app/core/models/questionary.model';
import { AdherentDoc } from '@app/core/models/adherent-doc.model';
import { UtilService } from '@app/core/services/util.service';

@Component({
  selector: 'app-adherent-doc',
  templateUrl: './adherent-doc.component.html',
  styleUrls: ['./adherent-doc.component.scss']
})
export class AdherentDocComponent implements OnInit {
  @Input() adherent: Adherent;
  @Input() isMember: boolean = false;
  @Output() savePdf: EventEmitter<PdfInfo> = new EventEmitter<PdfInfo>();
  @Output() changed: EventEmitter<Adherent> = new EventEmitter<Adherent>();
  formGroup: FormGroup;
  //licenceInputMask: string;
  checked: CheckAdherent = new CheckAdherent();
  healthfile: File;
  subModal: Subscription;
  notifier = new Subject<void>();
  category: string;
  editPhoto: boolean = true;
  isMobile = false;
  photo_default = 'assets/images/user-default.png';
  firstLicence = false;
  savedLicence: string;

  constructor(
    private fb: FormBuilder,
    private util: UtilService,
    private inscriptionService: InscriptionService,
    private adherentService: AdherentService,
    private photoService: PhotoService,
    private modalService: ModalService) { }

  async ngOnInit() {
    if (window.matchMedia('(max-width: 1025px)').matches) {
      this.isMobile = true;
    }
    if (this.adherent) {
      //this.licenceInputMask = this.inscriptionService.licenceInputMask;
      this.savedLicence = this.adherent.Licence;
      this.initForm();
      this.formGroup.markAllAsTouched();
      this.adherentService.getCategories().then(result => {
        this.category = result.find(c => c.Code === this.adherent.Category)?.Libelle;
      });
      this.formGroup.valueChanges.subscribe(async val => {
        this.setFormAdherent();
        await this.checkAdherent(this.adherent);
        this.changed.emit(this.adherent);
      });
      this.editPhoto = !this.adherent.Photo;
      this.checked = await this.inscriptionService.checkAdherent(this.checked, this.adherent, 3, this.isMember);
      console.log('checked in adherent-card: ', this.checked);
    }
  }

  initForm() {
    this.formGroup = this.fb.group({
      'licence': [this.adherent.Licence, [CustomValidators.licenceCheck(this.checked)]],
      'file': [null, [Validators.required, FileValidator.maxContentSize(this.inscriptionService.filemaxsize)]],
      'rgpd': [this.adherent.Rgpd, [Validators.requiredTrue]],
      'firstLicence': [this.firstLicence]
    });
  }

  async checkAdherent(adherent: Adherent) {
    this.checked = await this.inscriptionService.checkAdherent(this.checked, adherent, 3, this.isMember);
    console.log('checked: ', this.checked);
  }

  firstLicenceClick() {
    const checked = this.formGroup.get('firstLicence').value;
    this.adherent.Licence = checked ? 'création' : this.savedLicence;
    console.log('current licence: ', this.adherent.Licence);
    console.log('saved licence: ', this.savedLicence);
  }

  getLicenceError(field: string) {
    if (!this.firstLicence) {
      // if (!this.formGroup.get('licence').value) return 'Le n° de licence est requis';
      // return this.inscriptionService.getLicenceError(this.formGroup, field);
      if (this.formGroup.get('licence').value) return this.inscriptionService.getLicenceError(this.formGroup, field);
    }
    return '';
  }

  getPhotoError() {
    return !this.adherent.Photo;
  }

  getCheckError(field: string): string | boolean {
    return this.inscriptionService.getCheckError(this.formGroup, field);
  }

  showEditPhoto() {
    const div = document.querySelector('#mep');
    if (div && !div.classList.contains('mat-expanded')) {

    }
    this.editPhoto = true;
  }

  showModalPhoto(mode: string) {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
    this.modalService.open({
      title: mode === 'camera' ? 'Prendre une photo' : 'Recadrer la photo',
      validateLabel: 'Valider',
      cancelLabel: 'Annuler',
      showCancel: false,
      showValidate: false,
      size: {
        width: this.isMobile ? '100%' : '500px',
        height: mode === 'cropper' ? '390px' : (this.isMobile ? '445px' : '620px')
      },
      component: mode,
      data: mode === 'cropper' ? this.adherent.Photo : null
    });
    this.subModal = this.modalService.returnData
      .pipe(takeUntil(this.notifier))
      .subscribe(result => {
        console.log('data received from modal: ', result);
        if (result?.data) {
          this.setPhoto(result.data);
          this.notifier.next();
          this.notifier.complete();
        }
      });
  }

  onSelectPhoto(fileList: FileList) {
    console.log(fileList);
    this.photoService.getBase64(fileList[0]).then(result => {
      if (result) {
        this.setPhoto(result);
      }
    }).catch(err => {
      console.log('Error: ', err);
    });
  }

  onPhoto(photo: string) {
    this.setPhoto(photo);
    this.editPhoto = false;
  }

  setPhoto(dataurl: string) {
    const blob = this.util.dataURLtoBlob(dataurl);
    const ext = this.util.mime2ext(dataurl);
    if (blob && ext) {
      Adherent.addDoc(this.adherent, 'photo', 'photo.' + ext, blob);
    }
    console.log('adherent with photo: ', this.adherent);
    this.adherent.Photo = dataurl;
    this.changed.emit(this.adherent);
  }

  showModalAuthParent() {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
    this.modalService.open({
      title: 'Autorisation parentale',
      validateLabel: 'Valider',
      cancelLabel: 'Annuler',
      showCancel: true,
      showValidate: true,
      size: {
        width: '100%',
        height: '800px'
      },
      component: 'parent-auth',
      data: this.adherent
    });
    this.subModal = this.modalService.returnData
      .pipe(takeUntil(this.notifier))
      .subscribe(result => {
        if (result?.data) {
          const filename = `autorisation.pdf`;
          Adherent.addDoc(this.adherent, 'autorisation', filename, result.data);
          this.adherent.Authorization = filename;
          const tels: string[] = [];
          if (result.data.telfixe) {
            tels.push(result.data.telfixe);
          }
          if (result.data.mobile) {
            tels.push(result.data.mobile);
          }
          this.adherent.ParentPhone = tels.join(',');
          console.log('adherent with docs : ', this.adherent);
          this.notifier.next();
          this.notifier.complete();
        }
      });
  }

  showHealthForm() {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
    const major = this.adherent.Age >= 18;
    const data = major ? Questionary.getMajor(this.adherent.LastName, this.adherent.FirstName, this.adherent.BirthdayDate) : Questionary.getMinor(this.adherent.LastName, this.adherent.FirstName, this.adherent.Age, this.adherent.Genre);
    this.modalService.open({
      title: data.title,
      validateLabel: 'Valider',
      cancelLabel: 'Annuler',
      showCancel: true,
      showValidate: true,
      size: {
        width: '100%',
        height: major ? '830px' : '650px'
      },
      component: 'health-form',
      data: data
    });
    this.subModal = this.modalService.returnData
      .pipe(takeUntil(this.notifier))
      .subscribe(result => {
        if (result?.data) {
          const filename = `attestation.pdf`;
          Adherent.addDoc(this.adherent, 'attestation', filename, result.data);
          this.adherent.HealthFile = filename;
          console.log('adherent with docs : ', this.adherent);
          this.notifier.next();
          this.notifier.complete();
        }
      });
  }

  onFileChange(event) {
    console.log('onFileChange: ', event.file);
    const file = <File>event.file?.files[0];
    if (file) {
      console.log('choosen file: ', file);
      this.util.readFile(file).then(blob => {
        const name = file.name;
        const extension = file.name.substring(name.lastIndexOf('.'));
        const filename = `certificat${extension}`;
        console.log('certificat filename: ', filename);
        Adherent.addDoc(this.adherent, 'certificat', filename, blob);
        this.adherent.CertificateFile = filename;
        console.log('adherent changed: ', this.adherent);
      });
    }
  }

  setFormAdherent() {
    this.firstLicence = this.formGroup.get('firstLicence').value;
    this.adherent.Licence = this.firstLicence ? 'création' : this.formGroup.get('licence').value;
    this.savedLicence = this.adherent.Licence;
    this.adherent.Rgpd = this.formGroup.get('rgpd').value;
  }
}

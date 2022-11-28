import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '@app/admin/services/form.service';
import { WysiswygService } from '@app/admin/services/wysiswyg.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { AdminService } from '@app/core/services/admin.service';
import { RouteService } from '@app/core/services/route.services';
import { ImageRequest } from 'projects/editor/src/lib/models/image-request.model';
import { AngularEditorConfig, FocusedItem } from 'projects/editor/src/public-api';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html',
  styleUrls: ['./item-edit.component.scss']
})
export class ItemEditComponent implements OnInit {
  tree: Tree;
  slug: string;
  id: number;
  title: string;
  content: string;
  item: WebItem;
  saved: WebItem;
  items: WebItem[];
  formGroup: FormGroup;
  backTitle: string;
  requiredAlert: string = 'Ce champ est requis';
  post: any = '';
  formErrors = {
    title: '',
    slug: '',
    description: ''
  };
  initialValues: any;
  wysiswygConfig: AngularEditorConfig;
  rightOpened = true;

  constructor(
    private formBuilder: FormBuilder,
    private routeService: RouteService,
    private router: Router,
    private adminService: AdminService,
    private formService: FormService,
    private editor: WysiswygService,
    private route: ActivatedRoute
    ) { 
      console.log('edit constructor');
      this.routeService.subscribeConfig(tree => {
        if (tree) {
          console.log('editing page: tree ', tree);
          this.tree = tree;
          this.initItem();
        }
      }, 'subTreePageEdit');
    }

  ngOnInit(): void {
    this.initItem();
  }

  initItem() {
    this.id = Number(this.route.snapshot.params['id']);
    console.log('editing id: ', this.id);
    if (this.tree && this.id) {
      const type = document.location.href.includes('pages') ? 'page' : 'post';
      this.items = type === 'page' ? this.tree.pages : this.tree.posts;
      this.backTitle = 'Liste des ' + (type === 'page' ? 'pages' : 'commentaires');
      this.item = this.items.find(p => p.id === this.id);
      console.log('editing page: ', this.item);
      if (this.item) {
        this.saved = WebItem.copyItem(this.item);
        this.bindValues();
        this.createForm();
        this.initWysiswyg();
        this.initialValues = this.formGroup.value;
        this.formService.markFormGroupTouched(this.formGroup);
        this.formErrors = this.formService.validateForm(this.formGroup, this.formErrors);
      }
    }
  }

  bindValues() {
    this.title = this.item.Title;
    this.slug = this.item.Slug;
    this.content = this.item.Content;
  }

  createForm() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    this.formGroup = this.formBuilder.group({
      'title': [this.item.Title, [Validators.required, this.formService.checkExists.bind(this, this.items, this.item, 'Title', true)]],
      'slug': [this.item.Slug, [Validators.required, this.formService.checkExists.bind(this, this.items, this.item, 'Slug', true)]],
      'description': [this.item.Description, [Validators.minLength(0), Validators.maxLength(100)]],
      //'content': [this.item.Content]
    });
  }

  setChangeValidate() {
    this.formGroup.updateValueAndValidity();
    // this.formGroup.get('validate').valueChanges.subscribe(
    //   (validate) => {
    //     if (validate === '1') {
    //       this.formGroup.get('title').setValidators([Validators.required, Validators.minLength(3)]);
    //       this.titleAlert = "3 caractères au minimum";
    //     } else {
    //       this.formGroup.get('title').setValidators(Validators.required);
    //     }
    //     this.formGroup.get('title').updateValueAndValidity();
    //   }
    // )
  }

  getErrorTitle() {
    return this.formGroup.get('title').hasError('required') ? this.requiredAlert :
        this.formGroup.get('title').hasError('alreadyInUse') ? 'Ce titre est déjà utilisé' : '';
  }

  getErrorSlug() {
    return this.formGroup.get('slug').hasError('required') ? this.requiredAlert :
        this.formGroup.get('slug').hasError('alreadyInUse') ? 'Cette url est déjà utilisée' : '';
  }

  getErrorDescription() {
    return this.formGroup.get('description').hasError('required') ? this.requiredAlert :
      this.formGroup.get('description').hasError('pattern') ? 'Not a valid emailaddress' :
        this.formGroup.get('description').hasError('alreadyInUse') ? 'This emailaddress is already in use' : '';
  }

  onContentChange() {
    console.log(this.formGroup.get('content').value);
  }

  onSubmit(post: any) {
    this.post = post;
    console.log('form submitted: ', post);
    console.log('content: ', this.content);
    this.item.oldpath = this.item.Slug !== post.slug ? this.item.Slug : null;
    this.item.Title = post.title;
    this.item.Slug = post.slug;
    this.item.Description = post.description;
    this.item.Content = this.content;
    this.item.Modified = new Date();
    this.routeService.addOrUpdateInTree(this.item);
    this.adminService.addOrUpdateItem(this.item).then(item => {
      console.log('success during saving item', item);
      this.goBack();

    }).catch(err => {
      console.log('error during saving item', err);
    });
  }

  cancel() {
    if (this.formGroup && this.initialValues) {
      this.formGroup.reset(this.initialValues);
    }
  }

  goBack() {
    this.router.navigate(['admin/' + this.item.Type + 's']);
    
  }

  initWysiswyg() {
    this.wysiswygConfig = this.editor.init(() => {
        this.openGallery({
          index: null,
          origin: null,
          src: null,
          mode: 'add'
        });
      });
  }

  openGallery(request: ImageRequest) {
    //this.editor.openGallery(trequest);
  }

  onWysiswygFocus(item: FocusedItem) {
    // this.currentFocusElement = 'wysiswyg';
    // if (item.range && this.currentRange !== item.range) {
    //   this.focusItem = item;
    //   this.currentHtmlItem = item.element;
    //   this.currentRange = item.range;
    //   this.builderExpert.revealInEditor(this.currentHtmlItem);
    //   const iframe = (document.querySelector('#ifrm') as HTMLIFrameElement);
    //   if (iframe) {
    //     (iframe.contentDocument.querySelector('#ngEditor') as HTMLDivElement).focus();
    //   }
    //   // if (iframe && this.currentRange) {
    //   //   const sel = iframe.contentDocument.getSelection(); // window.getSelection();
    //   //   sel.removeAllRanges();
    //   //   sel.addRange(this.currentRange);
    //   // }
    // }
  }

  onWysiswygBlur(el: FocusEvent) {
    console.log("Blurred", el);
    //this.currentFocusElement = null;
  }

  onWysiswygChange(html: string) {
    // if (this.oldHtml !== html) {
    //   this.builderExpert.updateByWysiswyg(this.oldHtml, html);
    //   this.oldHtml = html;
    //   this.html = html;
    //   this.htmlChanged.emit(this.html);
    // }
  }

  onImageRemoved(value: string) {
    // if (value === 'removed') {
    //   this.domService.removeResizeFrame();
    //   this.builderExpert.removeImage();
    // }
  }

  toggleRight() {
    this.rightOpened = !this.rightOpened;
  }

}

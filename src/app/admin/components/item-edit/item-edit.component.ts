import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '@app/admin/services/form.service';
import { Tree } from '@app/core/models/tree.model';
import { WebItem } from '@app/core/models/web-item.model';
import { RouteService } from '@app/core/services/route.services';

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
  item: WebItem;
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

  constructor(
    private formBuilder: FormBuilder,
    private routeService: RouteService,
    private router: Router,
    private formService: FormService,
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
        this.title = this.item.Title;
        this.slug = this.item.Slug;
        this.createForm();
        this.formService.markFormGroupTouched(this.formGroup);
        this.formErrors = this.formService.validateForm(this.formGroup, this.formErrors);
      }
    }
  }

  createForm() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    this.formGroup = this.formBuilder.group({
      'title': [this.item.Title, [Validators.required, this.formService.checkExists.bind(this, this.items, this.item, 'Title', true)]],
      'slug': [this.item.Slug, [Validators.required, this.formService.checkExists.bind(this, this.items, this.item, 'Slug', true)]],
      'description': [this.item.Description, [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      'content': [this.item.Content, [Validators.required, Validators.minLength(10), Validators.maxLength(100)]]
      // 'email': [null, [Validators.required, Validators.pattern(emailregex)], this.checkInUseEmail],
      // 'password': [null, [Validators.required, this.checkPassword]],
      // 'validate': ''
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

  onSubmit(post) {
    this.post = post;
  }

  goBack() {
    this.router.navigate(['admin/' + this.item.Type + 's']);
  }

  // onKeyUp(event: any) {
  //   console.log('keyup on editable: ', event);
  //   const item = event.target;
  //   if (item) {
  //     event.stopImmediatePropagation();
  //     this.page.Title = item.innerText;
      
  //   }
    
  // }

}

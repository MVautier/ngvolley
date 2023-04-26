import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@app/admin/services/user.service';
import { User } from '@app/authentication/models/user.model';
import { ConnectionInfoService } from '@app/authentication/services/connexion-info.service';
import { Role } from '@app/core/models/role.model';
import { UserRole } from '@app/core/models/user-role.model';
import { InscriptionService } from '@app/inscription/services/inscription.service';
import { CustomValidators } from '@app/inscription/validators/custom-validators';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {
    @Input() user: UserRole;
    @Output() onSave: EventEmitter<UserRole> = new EventEmitter<UserRole>();
    @Output() onRemove: EventEmitter<void> = new EventEmitter<void>();
    roles: Role[] = [];
    isMobile = false;
    formGroup: FormGroup;
    currentUser: User;
    isAdmin = false;

    constructor(
        private fb: FormBuilder,
        private connexionInfo: ConnectionInfoService,
        private userService: UserService,
        private inscriptionService: InscriptionService
        ) { 
            this.userService.obsRoles.subscribe(roles => {
                this.roles = roles;
            });
            this.currentUser = this.connexionInfo.UserInfo;
            this.isAdmin = this.currentUser.Role === 'admin';
        }

    ngOnInit(): void {
        if (window.matchMedia('(max-width: 1025px)').matches) {
            this.isMobile = true;
        }
        if (this.user && this.roles.length) {
            this.initForm();
        }
    }

    initForm() {
        const patterns = this.inscriptionService.patterns;
        this.formGroup = this.fb.group({
            'nom': [this.user.Nom, [Validators.required]],
            'prenom': [this.user.Prenom, [Validators.required]],
            'mail': [this.user.Mail, [Validators.required, Validators.pattern(patterns.email.pattern)]],
            'creationDate': [this.user.CreationDate, [Validators.required]],
            'role': [this.user.IdRole, [Validators.required]]
        });
    }

    getInputError(field: string) {
        return this.inscriptionService.getInputError(this.formGroup, field);
    }

    save() {
        this.onSave.emit(this.user);
    }

    remove() {
        this.onRemove.emit();
    }

}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AdherentService } from '@app/core/services/adherent.service';
import { MailingListService } from '@app/admin/services/mailing-list.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-mailing-list-modal',
    templateUrl: './mailing-list-modal.component.html',
    styleUrls: ['./mailing-list-modal.component.scss'],
    standalone: false
})
export class MailingListModalComponent implements OnInit {
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
    emails: string[] = [];
    subject: string;
    body: string;
    sending = false;

    constructor(
        private mailingListService: MailingListService,
        private adherentService: AdherentService,
        private toastr: ToastrService) { }

    ngOnInit(): void {
        this.mailingListService.list$.subscribe(list => this.emails = list);
    }

    remove(email: string) {
        this.mailingListService.remove(email);
    }

    canSend(): boolean {
        return !this.sending && this.emails.length > 0 && !!this.subject && !!this.body;
    }

    onSend() {
        if (!this.canSend()) {
            return;
        }
        this.sending = true;
        this.adherentService.sendMailing({ subject: this.subject, body: this.body, emails: this.emails }).then(() => {
            this.toastr.success('Message envoyé à ' + this.emails.length + ' destinataire(s)', 'Liste de diffusion');
            this.mailingListService.clear();
            this.subject = null;
            this.body = null;
            this.cancel.emit();
        }).catch(err => {
            this.toastr.error('Erreur: ' + err.message, 'Liste de diffusion');
        }).finally(() => {
            this.sending = false;
        });
    }

    onCancel() {
        this.cancel.emit();
    }
}

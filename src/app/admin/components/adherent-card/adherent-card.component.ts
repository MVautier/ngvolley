import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AdherentAdminService } from '@app/admin/services/adherent-admin.service';
import { Adherent } from '@app/core/models/adherent.model';

@Component({
  selector: 'app-adherent-card',
  templateUrl: './adherent-card.component.html',
  styleUrls: ['./adherent-card.component.scss']
})
export class AdherentCardComponent implements OnInit {
  @Input() adherent: Adherent;
  @Output() hide: EventEmitter<void> = new EventEmitter<void>();
  constructor(private adherentAdminService: AdherentAdminService) { }

  ngOnInit(): void {
    
  }

  returnToListe() {
    this.hide.emit();
  }

}

import { Component } from '@angular/core';
import { Adherent } from '@app/core/models/adherent.model';
import { Parameters } from '@app/core/models/parameters.model';
import { AdherentService } from '@app/core/services/adherent.service';
import { ToastrService } from 'ngx-toastr';

type EntryStatus = 'new' | 'exists' | 'parse-error' | 'created' | 'create-error';

interface BatchEntry {
  line: number;
  lastName: string;
  firstName: string;
  birthday: Date | null;
  status: EntryStatus;
  existingId?: number;
  createdId?: number;
  message?: string;
}

@Component({
  selector: 'app-preinscription-page',
  templateUrl: './preinscription-page.component.html',
  styleUrls: ['./preinscription-page.component.scss'],
  standalone: false
})
export class PreinscriptionPageComponent {

  inputText = '';
  entries: BatchEntry[] = [];
  analyzing = false;
  creating = false;
  params: Parameters | null = null;

  readonly displayedColumns = ['line', 'status', 'name', 'birthday', 'id', 'message'];

  get hasAnalysis(): boolean { return this.entries.length > 0; }
  get newEntries(): BatchEntry[] { return this.entries.filter(e => e.status === 'new'); }
  get createdEntries(): BatchEntry[] { return this.entries.filter(e => e.status === 'created'); }
  get createdIds(): number[] { return this.createdEntries.map(e => e.createdId); }
  get canCreate(): boolean { return this.newEntries.length > 0 && !this.creating; }

  constructor(
    private adherentService: AdherentService,
    private toastr: ToastrService
  ) {}

  statusLabel(status: EntryStatus): string {
    const labels: Record<EntryStatus, string> = {
      'new': 'Nouveau',
      'exists': 'Existe déjà',
      'parse-error': 'Format invalide',
      'created': 'Créé',
      'create-error': 'Erreur création'
    };
    return labels[status];
  }

  reset() {
    this.entries = [];
    this.params = null;
  }

  private parseLines(): BatchEntry[] {
    return this.inputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map((line, i) => {
        const parts = line.split(';').map(p => p.trim());
        if (parts.length < 3) {
          return { line: i + 1, lastName: line, firstName: '', birthday: null, status: 'parse-error', message: 'Format attendu : NOM;Prénom;JJ/MM/AAAA' } as BatchEntry;
        }
        const [lastName, firstName, dateStr] = parts;
        if (!lastName || !firstName) {
          return { line: i + 1, lastName, firstName, birthday: null, status: 'parse-error', message: 'Nom ou prénom manquant' } as BatchEntry;
        }
        const sep = dateStr.includes('/') ? '/' : '-';
        const dp = dateStr.split(sep).map(Number);
        if (dp.length !== 3 || dp.some(isNaN)) {
          return { line: i + 1, lastName, firstName, birthday: null, status: 'parse-error', message: 'Date invalide (JJ/MM/AAAA ou JJ-MM-AAAA)' } as BatchEntry;
        }
        const [d, m, y] = dp;
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
          return { line: i + 1, lastName, firstName, birthday: null, status: 'parse-error', message: 'Date hors limites' } as BatchEntry;
        }
        return { line: i + 1, lastName, firstName, birthday: new Date(y, m - 1, d), status: 'new' } as BatchEntry;
      });
  }

  async onAnalyze() {
    this.entries = this.parseLines();
    const toCheck = this.entries.filter(e => e.status === 'new');
    if (!toCheck.length) return;

    this.analyzing = true;
    for (const entry of toCheck) {
      try {
        const found = await this.adherentService.searchAdherent(entry.lastName, entry.firstName, entry.birthday);
        if (found) {
          entry.status = 'exists';
          entry.existingId = found.IdAdherent;
        }
      } catch {
        // non trouvé → reste 'new'
      }
    }
    this.entries = [...this.entries];
    this.analyzing = false;
  }

  async onCreateNew() {
    this.creating = true;
    const saison = this.adherentService.obsSeason.value;
    const toCreate = [...this.newEntries];

    for (const entry of toCreate) {
      try {
        const adh = new Adherent(null, null, false, saison);
        adh.LastName = entry.lastName;
        adh.FirstName = entry.firstName;
        adh.BirthdayDate = entry.birthday;
        const created = await this.adherentService.addOrUpdate(adh);
        entry.status = 'created';
        entry.createdId = created.IdAdherent;
      } catch (err: any) {
        entry.status = 'create-error';
        entry.message = err?.message || 'Erreur inconnue';
      }
    }

    this.entries = [...this.entries];
    this.creating = false;

    if (this.createdIds.length) {
      this.params = await this.adherentService.getParams().catch(() => null);
    }
  }

  async addToFilter(replace: boolean) {
    if (!this.params || !this.createdIds.length) return;

    const existing = !replace && this.params.InscriptionFilter && this.params.InscriptionFilter !== '*'
      ? this.params.InscriptionFilter.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : [];
    const merged = [...new Set([...existing, ...this.createdIds])];
    this.params.InscriptionFilter = merged.join(',');

    try {
      await this.adherentService.setParams(this.params);
      this.toastr.success(`Filtre mis à jour : ${this.params.InscriptionFilter}`, 'Pré-inscription');
    } catch {
      this.toastr.error('Erreur lors de la mise à jour du filtre', 'Pré-inscription');
    }
  }
}

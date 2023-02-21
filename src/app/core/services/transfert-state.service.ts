import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {makeStateKey, StateKey, TransferState} from '@angular/platform-browser';
import {isPlatformServer} from '@angular/common';
import { SsrService } from '@app/ui/layout/services/ssr.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class TransferStateService extends TransferState {
    constructor(private ssrService: SsrService) {
        super();
    }

    public get<T>(key: StateKey<T>, defaultValue: T): T {
        if (!this.ssrService.isServer()) {
            return this._get(key, defaultValue);
        } else {
            return super.get(key, defaultValue);
        }
    }

    public set<T>(key: StateKey<T>, value: T): void {
        if (!this.ssrService.isServer()) {
            this._set(key, value);
        } else {
            super.set(key, value);
        }
    }

    public hasKey<T>(key: StateKey<T>): boolean {
        if (!this.ssrService.isServer()) {
            return this._hasKey(key);
        } else {
            return super.hasKey(key);
        }
    }


    private _get<T>(key: StateKey<T>, defaultValue: T): T {
        Object.values(document.scripts).forEach((s) => {
            if (s.id === environment.ssr.stateTransferAppId + '-state') {
                try {                    
                    const value = JSON.parse(s.textContent.replace(/&q;/g, '"'))[key];
                    defaultValue = value;
                } catch (e) {
                }
            }
        })
        return defaultValue;
    }

    private _set<T>(key: StateKey<T>, value: T): void {        
        if (!this._stateTransferExists()) this._createStateTransfer();
        
        const stateTransfer = this._getFullStateTransferJSON();
        stateTransfer[key] = value;
        const stateTransferElement = this._getFullStateTransferHtmlScriptElement();
        stateTransferElement.textContent = JSON.stringify(stateTransfer).replace(/"/g,"&q;");        
    }

    private _hasKey<T>(key: StateKey<T>): boolean {
        var found: boolean = false;
        Object.values(document.scripts).forEach((s) => {
            if (s.id === environment.ssr.stateTransferAppId + '-state') {
                try {
                    const value = JSON.parse(s.textContent.replace(/&q;/g, '"'))[key];
                    if (value) {
                        found = true;
                    }
                } catch (e) { }
            }
        })
        return found;
    }

    private _stateTransferExists(): boolean {
        var found: boolean = false;
        Object.values(document.scripts).forEach((s) => {
            if (s.id === environment.ssr.stateTransferAppId + '-state') {
                found = true;
            }
        })
        return found;
    }

    private _createStateTransfer(): void {
        const el = document.createElement('script');
        el.id = environment.ssr.stateTransferAppId + '-state';
        el.type = "application/json";
        el.textContent = '{}';
        document.body.appendChild(el);
    }

    private _getFullStateTransferJSON<T>(): T {
        var found: T = null;
        Object.values(document.scripts).forEach((s) => {
            if (s.id === environment.ssr.stateTransferAppId + '-state') {
                found = JSON.parse(s.textContent.replace(/&q;/g, '"'));                
            }
        })
        return found;
    }
    
    private _getFullStateTransferHtmlScriptElement(): HTMLScriptElement {
        var found: HTMLScriptElement;
        Object.values(document.scripts).forEach((s) => {
            if(s.id === environment.ssr.stateTransferAppId + '-state') {
                found = s;
            }
        })
        return found;
    }
}
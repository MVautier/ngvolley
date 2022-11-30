import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { EditorService } from 'projects/editor/src/public-api';
import { GalleryService } from './gallery.service';


@Injectable()
export class WysiswygService {
    wyConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        showColorInputText: true,
        enableHistory: true,
        //enableTable: true,
        placeholder: 'Commencez votre composition...',
        defaultParagraphSeparator: '',
        //defaultFontName: 'roboto',
        defaultFontSize: '',
        rawPaste: true,
        fonts: [
            {class: 'roboto', name: 'Roboto, "Helvetica Neue", sans-serif'},
            {class: 'arial', name: 'Arial, Helvetica, sans-serif'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
        ],
        uploadUrl: null,
        //upload: (file: File) => { console.log('exporting file', file) },
        uploadWithCredentials: true,
        //token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6eyJJZCI6MiwiVXNlck5hbWUiOiJkZXZjZGlyZWN0QGNhcnRlZ2llLmNvbSIsIkxhc3ROYW1lIjoiQXdhcmUiLCJGaXJzdE5hbWUiOiJFcXVpcGUiLCJFbWFpbCI6ImRldmNkaXJlY3RAY2FydGVnaWUuY29tIiwiRXhwaXJlcyI6IjIwMjItMDctMTZUMTI6MzM6NTEuNjc2MTgxNiswMjowMCIsIlVzZXJNb2R1bGVzIjpbeyJHdWlkTW9kdWxlIjoiMTUxNTYxMzctOTY2Yi00YTJmLTg4YzEtMTE5OThlZGM0MWEyIiwiR3VpZFVzZXIiOiI5MTcxNzMzOS0wN0QxLTRCOEUtODU1NC1GNERGNUQyRkREQzIiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH0seyJHdWlkTW9kdWxlIjoiMWMyZGFjODQtMWI4Mi00MGE1LWJkYWItMzBmYTI3YWFjNjY1IiwiR3VpZFVzZXIiOiI0NUNEOTJBMS1GMTcxLTQ5NjgtQkUxMy0yM0QzQTFGMTc4NTQiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH0seyJHdWlkTW9kdWxlIjoiODQzYTc0NDctNmEyMC00ZGI5LTllNGUtYjk3ZGJmMWJhMTI2IiwiR3VpZFVzZXIiOiI5MTcxNzMzOS0wN0QxLTRCOEUtODU1NC1GNERGNUQyRkREQzIiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH0seyJHdWlkTW9kdWxlIjoiZTM0ZDA1YTYtZDExZC00NmJlLWIzYTYtYjhhZTE1YTIzOTIwIiwiR3VpZFVzZXIiOiI5MTcxNzMzOS0wN0QxLTRCOEUtODU1NC1GNERGNUQyRkREQzIiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH0seyJHdWlkTW9kdWxlIjoiNDM4ZGZkNDYtNjgzZS00NzJkLTkyYmQtMGRjMGI1NjA5YmIxIiwiR3VpZFVzZXIiOiIwMTU5QkVBMS02QjY3LTQ1OUItOEE1Qi03QkFCOEI4M0NFMEMiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH0seyJHdWlkTW9kdWxlIjoiODQzOTA3N2QtYTdkNi00ODMzLWIyMWYtYjQ2YmRiNWUyMGMxIiwiR3VpZFVzZXIiOiI5MTcxNzMzOS0wN0QxLTRCOEUtODU1NC1GNERGNUQyRkREQzIiLCJEYXRlRXhwaXJhdGlvbiI6bnVsbH1dLCJHdWlkVXNlck1vZHVsZSI6IjkxNzE3MzM5LTA3ZDEtNGI4ZS04NTU0LWY0ZGY1ZDJmZGRjMiIsIlRva2VuIjpudWxsLCJHdWlkVXRpbGlzYXRldXIiOiI5MTcxNzMzOS0wN2QxLTRiOGUtODU1NC1mNGRmNWQyZmRkYzIiLCJHdWlkQ29tcHRlIjoiNjRmNDQ1NDItNDQ4ZC00OTZjLThhOGItNWVhOTU4M2M2OWM4IiwiQXV0aGVudGlmaWVyRW1haWwiOnRydWUsIlJvbGVzIjpbIjE1MTU2MTM3LTk2NmItNGEyZi04OGMxLTExOTk4ZWRjNDFhMl9hZG1pbiIsIjE1MTU2MTM3LTk2NmItNGEyZi04OGMxLTExOTk4ZWRjNDFhMl9hZG1pbmJvIiwiODQzYTc0NDctNmEyMC00ZGI5LTllNGUtYjk3ZGJmMWJhMTI2X2FkbWluYm8iLCIxNTE1NjEzNy05NjZiLTRhMmYtODhjMS0xMTk5OGVkYzQxYTJfdXNlciIsIjE1MTU2MTM3LTk2NmItNGEyZi04OGMxLTExOTk4ZWRjNDFhMl9lbmRfY3VzdG9tZXIiLCI4NDNhNzQ0Ny02YTIwLTRkYjktOWU0ZS1iOTdkYmYxYmExMjZfdXNlciIsIjg0M2E3NDQ3LTZhMjAtNGRiOS05ZTRlLWI5N2RiZjFiYTEyNl9wcmVtaXVtIiwiMWMyZGFjODQtMWI4Mi00MGE1LWJkYWItMzBmYTI3YWFjNjY1X3VzZXIiLCIxYzJkYWM4NC0xYjgyLTQwYTUtYmRhYi0zMGZhMjdhYWM2NjVfcHJlbWl1bSIsIjQzOGRmZDQ2LTY4M2UtNDcyZC05MmJkLTBkYzBiNTYwOWJiMV91c2VyIiwiNDM4ZGZkNDYtNjgzZS00NzJkLTkyYmQtMGRjMGI1NjA5YmIxX3ByZW1pdW0iLCJlMzRkMDVhNi1kMTFkLTQ2YmUtYjNhNi1iOGFlMTVhMjM5MjBfdXNlciIsImUzNGQwNWE2LWQxMWQtNDZiZS1iM2E2LWI4YWUxNWEyMzkyMF9wcmVtaXVtIiwiODQzOTA3N2QtYTdkNi00ODMzLWIyMWYtYjQ2YmRiNWUyMGMxX3VzZXIiXSwiVXNlclRva2VuRVRRIjpudWxsLCJIYXNFVFEiOnRydWV9fQ.Wb7R1AGJmSqO__l0M2BVj2cOEH7yGj2cha-KHiwyeyo',
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
          ['customClasses'],
          ['insertImage'],
          //['toggleEditorMode']
        ],
        customButtons: [
          {
            iconClass: 'fa fa-image',
            title: 'insérer une image',
            buttonClick: null
          }
        ]
    };

    constructor(
      private gallery: GalleryService,
      private editor: EditorService
      ) {
        console.log('================= WysiswygService constructor');
    }

    init(actionGallery: any) {
        this.wyConfig.uploadUrl = environment.apiUrl + 'ckfinder/upload/';
        if (this.wyConfig.customButtons && this.wyConfig.customButtons.length) {
          let btn: any;
          if (actionGallery) {
            btn = this.wyConfig.customButtons.find(c => c.iconClass === 'fa fa-image');
            if (btn) {
              btn.buttonClick = {
                    name: '',
                    action: actionGallery
                };
            }
          }
        }
        return this.wyConfig;
    }

    insertImage(src: string) {
      this.editor.insertImage(src);
    }
}
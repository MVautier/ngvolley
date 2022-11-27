# ColomiersVolley

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Run SSL

### Génération d'un certificat :

Nécessite le SDK .NET 5.0 - Exécuter : `dotnet dev-certs https --trust`

- Ouvrez une console de management [Windows+R > `mmc`]
- Menu "Fichier > Ajouter / Supprimer un composants enfichable…"
- Sélectionnez "Certificats", cliquez sur "Ajoutez"
- Sélectionnez "Un compte d’ordinateur", cliquez sur "Suivant > Terminer"
- Cliquer sur OK pour revenir à la console avec la liste des certificats

- Double cliquez sur le certificat pour l’ouvrir
- Allez dans "Details", cliquez sur "Copiez dans un fichier"
- Cliquez sur "Suivant" et sélectionnez "Oui, exporter la clé privée" , puis cliquez sur "Suivant > Suivant"
- Cochez "Mot de passe" et saisissez-en un, "localhost" par exemple, puis "Suivant"
- Entrez le chemin du fichier à sauvegarder, par exemple "C:\localhost.pfx", puis cliquez sur "Suivant" et enfin "Terminer"

### Génération des fichiers .key et .crt

- Télécharger OpenSSL si besoin puis se placer dans "C:\openssl\bin"
- Copier localhost.pfx dans "C:\openssl\bin"
- Lancer les commandes ci-dessous :

	`.\openssl pkcs12 -in localhost.pfx -nocerts -out localhost.key -nodes`
    
	`.\openssl pkcs12 -in localhost.pfx -clcerts -nokeys -out localhost.crt`
- Copier les fichiers générés dans l'application
- Dans package.json, modifier le script :

	`"start": "ng serve --ssl --ssl-key path_to_ssl/localhost.key  --ssl-cert path_to_ssl/localhost.crt"`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

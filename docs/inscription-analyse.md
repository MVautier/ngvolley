# Analyse du module d'inscription

## 1. Périmètre et méthodologie

Cette analyse porte sur `src/app/inscription/**` et les fichiers directement liés (modèles partagés `src/app/core/models/`, configuration `src/environments/`), sur la base du code après la migration Angular 14 → 19 effectuée dans ce même travail (commit `3e89d51` au moment de la rédaction). Elle a été produite par lecture directe du code (composants, services, validateurs, modèles, routing), croisée avec l'historique git du module et des fichiers d'environnement.

Fichiers principaux passés en revue :
- `pages/inscription-page/inscription-page.component.ts` (orchestration du parcours, persistance localStorage, retour de paiement)
- `services/inscription.service.ts` (règles métier centrales : éligibilité, recherche d'adhérent existant)
- `services/helloasso.service.ts` (intégration paiement)
- `services/photo.service.ts`
- `validators/custom-validators.ts`
- `components/start-form/start-form.component.ts` (réinscription, filtre, recherche par nom+date de naissance)
- `components/cart-payment/cart-payment.component.ts` (formulaire payeur, déclenchement du paiement)
- `components/adherent-doc/adherent-doc.component.ts` (documents : certificat médical, licence, autorisation parentale)
- `src/app/core/models/parameters.model.ts`, `adherent.model.ts`
- `src/app/admin/pages/params-page/` (configuration des paramètres ci-dessus, côté admin)
- `src/environments/environment*.ts`
- Historique git filtré sur le module (`git log -- src/app/inscription/ src/environments/`)

Limite importante : la recherche d'adhérent existant (correspondance nom + prénom + date de naissance) est entièrement déléguée au backend (`AdherentService.searchAdherent`, hors périmètre de ce dépôt frontend). Le détail exact de l'algorithme de correspondance (sensibilité à la casse/aux accents, tolérance aux fautes de frappe) n'est donc pas vérifiable depuis ce code ; une fonction de normalisation côté client (`InscriptionService.normalize`, en minuscules + suppression des accents) existe mais est **du code mort** : elle n'est plus appelée que dans des blocs commentés (`inscription.service.ts:90-95,104-106`).

## 2. Règles de gestion

### 2.1 Ouverture/fermeture des inscriptions et bascule de mode

Contrairement à ce que suggèrent les champs commentés dans `src/environments/environment*.ts` (`inscriptionOpened`, `reinscription`, `inscriptionFilter`, lignes 31-33), ces interrupteurs **ne sont pas pilotés par l'environnement** mais par un enregistrement de configuration côté serveur, modélisé par `Parameters` (`src/app/core/models/parameters.model.ts`) et exposé via `AdherentService.getParams()`. Les champs d'environnement correspondants sont du code mort (confirmé : aucune référence à `environment.inscriptionOpened`/`reinscription`/`inscriptionFilter` ailleurs dans le code).

- `InscriptionPageComponent.getParams()` (`pages/inscription-page/inscription-page.component.ts:129-136`) charge ces paramètres au démarrage et alimente `this.inscriptionOpened` / `this.reinscription`.
- Le template (`inscription-page.component.html:22,31,83`) affiche le formulaire seulement si `reinscription || inscriptionOpened` est vrai, et adapte les textes selon le mode.
- Le mode "réinscription des jeunes" (juin, décrit par l'utilisateur) correspond donc à `Parameters.Reinscription = true`, positionné manuellement par un administrateur via `/admin` → Paramètres (`src/app/admin/pages/params-page/`), et non à une bascule automatique par date. L'historique git confirme cette gestion manuelle saison par saison : `feat: close inscriptions` (×2), `feat: reactivate ins`, `feat: deactivate all`, `feat: open inscription`, `feat: close reinscription`, `feat: site en maintenance`.

**Constat notable** : `Parameters` expose aussi `AdoOpened`, `LoisirOpened`, `CompetOpened` et `NbAdoMax`, configurables dans l'écran admin (`params-page.component.html:24-32`) — mais **aucun de ces quatre champs n'est lu dans le parcours d'inscription public** (`src/app/inscription/**`). Ce sont des réglages "décoratifs" actuellement sans effet sur le formulaire : un administrateur peut désactiver la catégorie "Loisirs" ou plafonner le nombre d'ados sans que cela bloque réellement une inscription. Voir [3.4](#34-paramètres-admin-non-appliqués-dans-le-parcours-public).

### 2.2 Reconnaissance des ré-inscriptions (nom + prénom + date de naissance)

Implémentée dans `StartFormComponent.onValidateAdo()` (`components/start-form/start-form.component.ts:73-98`) :

1. Appelle `InscriptionService.findAdo(nom, prenom, birthday)` (`services/inscription.service.ts:98-111`), qui délègue à `AdherentService.searchAdherent` (backend).
2. Si un résultat est trouvé, il est **filtré côté client** par une liste blanche d'identifiants : `Parameters.InscriptionFilter` (champ texte admin, ex. `"123,456"` ou `"*"`) est éclaté en `inscriptionFilterIds` (`start-form.component.ts:54`). Si la liste n'est pas vide et que l'`IdAdherent` trouvé n'y figure pas, le résultat est rejeté (`adofound = null`) même si la recherche nom+date de naissance a réussi (`start-form.component.ts:78-81`).
3. En cas d'échec (non trouvé *ou* trouvé mais hors liste), le même message générique `notFoundText` ("Un nom, un prénom et une date de naissance valides doivent être fournis...") est affiché — l'utilisateur ne peut pas distinguer une erreur de saisie d'un refus délibéré par la liste de filtrage. Voir [3.5](#35-message-derreur-générique-ambigu-pour-le-filtre-de-réinscription).
4. Un raccourci de test existe : si `reinscription && environment.debug`, les champs nom/prénom/date de naissance sont pré-remplis avec des valeurs fixes (`start-form.component.ts:56-60`). `environment.debug` vaut `false` dans les trois fichiers d'environnement actuels donc ce raccourci est inactif en l'état, mais reste un signal d'une fonctionnalité de confort de développement laissée dans le code de production.

### 2.3 Éligibilité par âge / catégorie

Trois implémentations indépendantes du calcul de seuil d'âge coexistent dans le module, **avec des bornes incohérentes entre elles** :

| Endroit | Année de référence | Date seuil "18 ans" | Comparateur |
|---|---|---|---|
| `InscriptionService.checkAdherent` (`services/inscription.service.ts:239`) | saison admin (`AdherentService.obsSeason`) | 31/12 de `saison-18` | `> 0` (catégories C/L) ou `<= 0` (catégorie E, même date) |
| `CustomValidators.dateCheck` (`validators/custom-validators.ts:11`) | année calendaire réelle (`new Date().getFullYear()`) | 31/12 de `année-minage` (minage=13, donc pas un seuil 18 ans mais le seuil "minimum 13 ans") | `>=` |
| `CustomValidators.checkAdult` (`validators/custom-validators.ts:33`) | année calendaire réelle | **01/09** de `année-18` | `>=` |

`InscriptionService.checkAdherent` (`inscription.service.ts:236-249`) calcule l'éligibilité par catégorie :
- Catégories `C` (Adultes licence FSGT) et `L` (Loisirs) : doit être né strictement avant le 31/12 de `saison-18`.
- Catégorie `E` (Ados, 13-17 ans) : doit être né entre le 31/12 de `saison-18` (inclus) et le 31/12 de `(saison+1)-13` (inclus).
- `check.age` est calculé séparément par `Adherent.getAge()` (`src/app/core/models/adherent.model.ts:108-110`), qui fait `anneeCourante - anneeNaissance` (pas de prise en compte du mois/jour) — une **quatrième** notion d'âge, utilisée ensuite pour `check.signatureNeeded = adherent.Age > 18` (`inscription.service.ts:252`), où `adherent.Age` (propriété stockée, recopiée depuis les données serveur) peut différer de `check.age` (recalculé à la volée).

Le payeur (formulaire de paiement, `CartPaymentComponent.initForm`, `components/cart-payment/cart-payment.component.ts:55-57`) utilise quant à lui `CustomValidators.checkAdult()` (seuil 1er septembre) pour valider que le payeur est majeur, donc une **cinquième** référence de date pour le même concept de majorité.

Cette fragmentation est directement héritée d'un correctif historique : le commit `a366261` ("correctif 18 ans") a remplacé un calcul basé sur `new Date().getMonth()` par le calcul basé sur la saison admin (`y`/`nextY`) **uniquement dans `inscription.service.ts`** — `custom-validators.ts` n'a pas été aligné à cette occasion et continue d'utiliser l'année calendaire réelle avec une date seuil différente (1er septembre au lieu du 31 décembre). Voir [3.1](#31-cinq-calculs-dâge-indépendants-et-incohérents).

### 2.4 Tarification et panier

Les tarifs ne sont **pas** ceux du bloc commenté dans `environment.ts` (`tarifs: { local, exterior, member, loisir, license, ado }`, lignes 20-27) mais proviennent intégralement de `Parameters` (`TarifLocal`, `TarifExterior`, `TarifMember`, `TarifLicense`, `TarifLoisir`, `TarifAdo`), configurables via `/admin` → Paramètres. Logique de calcul : `InscriptionPageComponent.onStep1Validate`/`getCartItemByCategory` (`inscription-page.component.ts:198-245,521-528`) :
- Adhésion de base : `TarifLocal` (adhérent du code postal local) ou `TarifExterior`, ou `0` si l'adhérent est déjà inscrit pour une autre section (`already`), ou `TarifMember` si un autre membre du foyer est déjà inscrit ailleurs (`already2`).
- Catégorie `C` → `TarifLicense`, `L` → `TarifLoisir`, sinon (Ados, `E`) → `TarifAdo`.
- Ajout d'un membre (`onAddMember`, ligne 350-363) : `TarifMember` fixe, indépendamment de sa catégorie.

### 2.5 Parcours de paiement HelloAsso

1. `CartPaymentComponent.sendCheckout()` (`components/cart-payment/cart-payment.component.ts:101-117`) appelle `HelloAssoService.sendCheckoutIntent(cart)`, qui poste le panier à l'API backend (`Helloasso/initiate`) — toute la logique OAuth HelloAsso (jeton, rafraîchissement) est commentée et déléguée au backend (`services/helloasso.service.ts:41-133`, code mort à nettoyer, voir [3.6](#36-code-mort-volumineux-dans-helloassoservice)).
2. Avant la redirection, le panier est sauvegardé dans `localStorage` (`cart-payment.component.ts:109`) et le navigateur est redirigé vers l'URL renvoyée par le backend (`window.location.href = result.redirectUrl`).
3. Au retour sur le site (même route, paramètres de requête `payment`, `code`, `checkoutIntentId`, `error`), `InscriptionPageComponent` (constructeur, `inscription-page.component.ts:90-123`) relit `cart`/`adherent` depuis `localStorage` et:
   - `payment=cancel` → étape 4 (panier/paiement), pas d'écriture en base.
   - `code=succeeded` → récupère l'URL du reçu (`getPaymentDoc`), écrit l'adhérent en base (`addOrUpdate`), étape 5.
   - `code=refused` → seulement un `console.log`, pas de message dédié à l'utilisateur au-delà de l'étape 5 générique (voir [3.3](#33-paiement-refusé--pas-de-message-dédié)).
4. `InscriptionPageComponent` déclare une propriété `redirectUrl` initialisée à une URL HelloAsso **sandbox** en dur (`inscription-page.component.ts:54`) ; elle n'est jamais lue ni assignée ailleurs dans la classe — code mort sans impact fonctionnel actuel, voir [3.7](#37-url-helloasso-sandbox-en-dur-et-non-utilisée).

### 2.6 Documents et photo

- Certificat médical / attestation : upload obligatoire (`Validators.required` sur le `FormControl 'file'`, `components/adherent-doc/adherent-doc.component.ts:78`), taille plafonnée à `InscriptionService.filemaxsize` (5 Mo, `inscription.service.ts:22`). La logique de renouvellement automatique tous les 3 ans (vérification de la date du certificat existant) est entièrement commentée et désactivée (`check.certifNeeded = false` forcé, `inscription.service.ts:208-226`) — voir [3.2](#32-règles-métier-désactivées-silencieusement).
- Vérification de licence existante (`check.licenceNeeded`) également désactivée en dur (`inscription.service.ts:230`).
- Autorisation parentale requise pour la catégorie `E` (Ados) si non déjà fournie (`check.parentAuthNeeded`, `inscription.service.ts:246`), saisie via un formulaire dédié (`components/parent-auth/`) générant un PDF signé.
- Photo et capture webcam/recadrage : `PhotoService` + `CropperComponent`/`CameraComponent`, formats gérés via `ngx-image-cropper`/`ngx-webcam`.

## 3. Bugs identifiés

### 3.1 Cinq calculs d'âge indépendants et incohérents

Voir [2.3](#23-éligibilité-par-âge--catégorie). Cinq endroits calculent une notion d'âge ou de seuil de majorité avec des références d'année (saison admin vs année calendaire réelle) et des dates seuils différentes (31/12 vs 01/09). Risque concret : autour d'un changement de saison (la saison admin et l'année calendaire réelle peuvent diverger pendant la période de transition), un même adhérent peut être jugé éligible par un contrôle et rejeté par un autre. C'est la classe de bug à l'origine du correctif historique `a366261` ("correctif 18 ans"), appliqué de façon incomplète (seul `inscription.service.ts` a été corrigé, pas `custom-validators.ts`).

### 3.2 Règles métier désactivées silencieusement

Dans `InscriptionService.checkAdherent` (`inscription.service.ts:207-230`), deux règles métier substantielles sont commentées et remplacées par des constantes :
- Renouvellement du certificat médical tous les 3 ans → toujours `false` (jamais redemandé automatiquement).
- Vérification de la nécessité d'une licence → toujours `false`.

Rien dans le code ne documente si cette désactivation est intentionnelle (choix produit) ou un oubli de mise en pause temporaire. Sans commentaire expliquant le *pourquoi*, ce code est un piège pour une prochaine modification : on peut facilement le supposer actif en lisant seulement les noms des propriétés (`certifNeeded`, `licenceNeeded`).

### 3.3 Paiement refusé : pas de message dédié

`InscriptionPageComponent` (constructeur, `inscription-page.component.ts:112-114`) : la branche `paymentCode === 'refused'` ne fait qu'un `console.log` puis passe à l'étape 5 comme en cas de succès partiel. Selon le template de l'étape 5 (non audité en détail ici), l'utilisateur dont le paiement a été refusé par HelloAsso risque de ne recevoir aucune indication claire que son inscription n'est *pas* finalisée.

### 3.4 Paramètres admin non appliqués dans le parcours public

Voir [2.1](#21-ouverturefermeture-des-inscriptions-et-bascule-de-mode). `Parameters.AdoOpened`, `LoisirOpened`, `CompetOpened`, `NbAdoMax` sont configurables dans `/admin` mais ne sont lus nulle part dans `src/app/inscription/**`. Un administrateur pensant fermer l'accès aux Loisirs ou plafonner le nombre d'ados via ces interrupteurs n'aura aucun effet réel sur le formulaire public.

### 3.5 Message d'erreur générique ambigu pour le filtre de réinscription

Voir [2.2](#22-reconnaissance-des-ré-inscriptions-nom--prénom--date-de-naissance). `StartFormComponent.onValidateAdo` affiche le même message ("nom/prénom/date de naissance invalides") que l'adhérent soit réellement absent de la base *ou* trouvé mais exclu par `InscriptionFilter`. Un parent dont l'enfant existe en base mais n'est pas sur la liste autorisée cette saison ne peut pas comprendre la raison du refus, et risque de ressaisir inutilement ses informations en pensant à une faute de frappe.

### 3.6 `JSON.parse` non protégé sur le contenu de `localStorage`

`InscriptionPageComponent` (`inscription-page.component.ts:96,139`) : `JSON.parse(localStorage.getItem('cart') as string)` et `getAdherentFromLocalstorage()` ne sont entourés d'aucun `try/catch`. Le cast `as string` (ajouté lors de la préparation à la migration TypeScript, commit `077714e`) corrige uniquement un avertissement de typage — il ne protège pas contre un contenu corrompu ou d'un format incompatible avec une version antérieure de l'application (changement de structure de `Cart`/`Adherent` entre deux déploiements, par exemple). Si la valeur stockée n'est pas un JSON valide, `JSON.parse` lève une exception non interceptée au chargement de la page de retour de paiement — précisément le moment le plus sensible du parcours (retour HelloAsso après paiement réel).

### 3.7 Boucle `forEach` avec callback `async` : la vérification de doublon ne bloque pas réellement

`InscriptionPageComponent.showPopupAdd()` (`inscription-page.component.ts:319-329`) :
```ts
this.adherent.Membres.forEach(async m => {
  const found = await this.inscriptionService.getExistingAdherent(m);
  ...
});
if (!error) { ... } // exécuté avant la résolution des appels async ci-dessus
```
`Array.prototype.forEach` n'attend pas les callbacks `async` : le code passé `if (!error)` s'exécute immédiatement, avant que les recherches réseau sur chaque membre additionnel n'aient eu le temps de répondre. En pratique, le contrôle "un membre ajouté est-il déjà inscrit cette saison ?" ne peut quasiment jamais déclencher son message d'erreur, car `error` est encore à sa valeur initiale (`false`) au moment du test.

### 3.8 `ngx-material-file-input` abandonné (déjà traité dans cette migration)

Signalé pour mémoire : la dépendance `ngx-material-file-input` (composant d'upload de certificat médical, `adherent-doc.component.html:128`) était abandonnée depuis 2021 et a cassé sous Angular Material 19 (import de `mixinErrorState`, supprimé du cœur de Material). Elle a été remplacée par une implémentation locale équivalente dans `src/app/inscription/components/file-input/` au cours de cette même migration (commit `0134575`). Mentionné ici car il s'agit d'une dépendance directement liée au flux d'inscription (upload du certificat médical) et que ce composant maison devra être maintenu manuellement (plus de mises à jour amont possibles).

## 4. Propositions d'amélioration

1. **Unifier le calcul d'âge/éligibilité.** Extraire une fonction pure unique (ex. `isEligibleForCategory(birthdate, category, seasonYear)`) utilisée à la fois par `InscriptionService.checkAdherent` et par `CustomValidators.dateCheck`/`checkAdult`, avec une seule référence d'année (la saison admin, pas l'année calendaire réelle) et une seule date seuil documentée. Couvrir par des tests aux bornes exactes (31/12, jour de l'anniversaire) — c'est précisément la classe de bug à l'origine du correctif historique `a366261`.
2. **Documenter ou réactiver les règles désactivées.** Pour `certifNeeded`/`licenceNeeded` (`inscription.service.ts:208-230`) : soit retirer le code mort si la décision produit est définitive, soit ajouter un commentaire daté expliquant pourquoi c'est désactivé et depuis quand, pour qu'un futur lecteur ne les réactive pas par erreur en supposant un oubli.
3. **Appliquer réellement `AdoOpened`/`LoisirOpened`/`CompetOpened`/`NbAdoMax`** dans le parcours public, ou les retirer de l'écran admin s'ils ne sont plus pertinents — un réglage configurable sans effet est pire qu'une absence de réglage.
4. **Différencier les messages d'échec de réinscription** (introuvable vs. trouvé-mais-filtré) dans `StartFormComponent`, au moins dans les logs si l'ambiguïté côté utilisateur est volontaire (éviter de révéler l'existence d'un filtre de sécurité).
5. **Sécuriser les lectures `localStorage`** (`cart`, `adherent`, `manualFill`) avec un helper `safeJsonParse` qui intercepte les erreurs et réinitialise l'état plutôt que de laisser planter la page de retour de paiement.
6. **Corriger la boucle `forEach` asynchrone** dans `showPopupAdd()` en utilisant `for...of` avec `await`, ou `Promise.all` sur les recherches, pour que la vérification de doublon fonctionne réellement.
7. **Ajouter un message dédié au paiement refusé** (`paymentCode === 'refused'`) plutôt que de réutiliser l'écran générique de l'étape 5.
8. **Nettoyer le code mort** : bloc OAuth HelloAsso commenté (`helloasso.service.ts:41-133`), `normalize()` non appelée (`inscription.service.ts:269-271`), propriété `redirectUrl` sandbox jamais lue (`inscription-page.component.ts:54`).
9. **Couvrir le module de tests unitaires.** À date, aucun fichier `*.spec.ts` n'existe pour `services/` ou `validators/` dans `src/app/inscription/`, et le seul spec de composant présent (`inscription-page.component.spec.ts`) est le squelette généré par défaut (un seul test `should create`, sans les providers nécessaires aux dépendances injectées — il échouerait s'il était réellement exécuté). À noter également : la cible `test` d'`angular.json` ne reprend pas le `stylePreprocessorOptions.includePaths` présent sur la cible `build`, ce qui fait actuellement échouer la compilation des styles SCSS pour `ng test colomiers-volley` (constat fait pendant cette migration, indépendant des changements de version Angular) — corriger ce point est un préalable pour pouvoir exécuter des tests du tout sur ce module.

## 5. Annexes

### Fichiers passés en revue
- `src/app/inscription/inscription.module.ts`, `inscription-routing.module.ts`
- `src/app/inscription/pages/inscription-page/inscription-page.component.ts`
- `src/app/inscription/services/inscription.service.ts`, `helloasso.service.ts`, `photo.service.ts`
- `src/app/inscription/validators/custom-validators.ts`
- `src/app/inscription/components/start-form/start-form.component.ts`
- `src/app/inscription/components/cart-payment/cart-payment.component.ts`
- `src/app/inscription/components/adherent-doc/adherent-doc.component.ts`
- `src/app/core/models/parameters.model.ts`, `adherent.model.ts`
- `src/app/admin/pages/params-page/params-page.component.ts`, `.html`
- `src/environments/environment.ts`, `environment.dev.ts`, `environment.prod.ts`
- `src/app/inscription/pages/inscription-page/inscription-page.component.spec.ts`

### Commits historiques pertinents
- `a366261` — *correctif 18 ans* : correction partielle du calcul de seuil d'âge dans `inscription.service.ts` (non répercutée dans `custom-validators.ts`).
- `dea4ceb` — *check date*
- `0f54c3d`, `325042f` — *close inscriptions*
- `35759f9` — *reactivate ins*
- `694687d` — *deactivate all*
- `1163e27` — *open inscription*
- `27f33b3` — *close reinscription*
- `7d1cca2` — *add inscription filter*
- `7693add` — *evol helloasso*
- `efe9fad` — *fix cors errors by helloasso*
- `67907c0` — *site en maintenance*
- `9accdcb` — *evol tarifs*
- `26fd82b` — *add parameters*

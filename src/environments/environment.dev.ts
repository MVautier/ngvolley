// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  environment: 'development',
  production: false,
  fullApp: false,
  clientID: 'ngColomiersVolley',
  apiRoot: 'https://localhost:444/',
  apiUrl: 'https://localhost:444/api/',
  cookieName: 'ColomiersVolleyNg',
  assoTitle: 'Club Loisirs Léo Lagrange de Colomiers',
  asso: 'CLLLC',
  urlassodocs: 'https://leolagrangecolomiers.org/documents-utiles-clll',
  postalcode: '31770',
  city: 'Colomiers',
  section: 'Volley-ball',
  firstSeason: 2022,
  tarifs: {
    local: 19,
    exterior: 27,
    member: 6,
    loisir: 34,
    license: 74,
    ado: 60
  },
  minage: 13,
  debug: false,
  ssrMode: false,
  inscriptionOpened: true,
  reinscription: false,
  inscriptionFilter: '10,66,89,90',
  basePath: 'https://localhost:4224/',
  basePathSsr: 'https://localhost:4200/',
  cookiePath: '/',
  cookieDomain: 'localhost',
  isSecure: true,
  sidenavOpened: false,
  ssr: {
    serverTimeoutMs: 30000,
    distFolder: 'dist/colomiers-volley/browser',
    stateTransferAppId: 'colomiers-volley'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

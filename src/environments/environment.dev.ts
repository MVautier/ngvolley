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
  tarifs: {
    local: 19,
    exterior: 27,
    member: 6,
    loisir: 34,
    license: 74,
    ado: 50
  },
  minage: 13,
  debug: true,
  ssrMode: false,
  inscriptionOpened: false,
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
  },
  helloasso: {
    authServer: 'https://api.helloasso-sandbox.com/oauth2',
    apiServer: 'https://api.helloasso-sandbox.com/v5',
    clienId: '3c01b037bb62492a9d12ffeed04ba0d3',
    clientSecret: 'TrpPOIZ0TKp1oMjTSpOrb/xg8bGyEDSd',
    itemName: 'Adhésion CLLL - Section Voley-Ball',
    organizationSlug: 'clll-colomiers-volley-ball'
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

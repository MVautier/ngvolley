export const environment = {
  environment: 'production',
  production: true,
  fullApp: false,
  clientID: 'ngColomiersVolley',
  apiRoot: 'https://api.inscription-colomiers-volley.fr/',
  apiUrl: 'https://api.inscription-colomiers-volley.fr/api/',
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
  reinscription: true,
  inscriptionFilter: '*',
  basePath: 'https://inscription-colomiers-volley.fr/',
  basePathSsr: 'https://inscription-colomiers-volley.fr/',
  cookiePath: '/',
  cookieDomain: 'inscription-colomiers-volley.fr',
  isSecure: true,
  sidenavOpened: true,
  ssr: {
    serverTimeoutMs: 30000,
    distFolder: 'dist/colomiers-volley/browser',
    stateTransferAppId: 'colomiers-volley'
  }
};

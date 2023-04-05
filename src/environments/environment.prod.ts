export const environment = {
  environment: 'production',
  production: true,
  fullApp: false,
  apiRoot: 'https://api.inscription-colomiers-volley.fr/',
  apiUrl: 'https://api.inscription-colomiers-volley.fr/api/',
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
  debug: false,
  ssrMode: false,
  basePath: 'https://inscription-colomiers-volley.fr/',
  basePathSsr: 'https://inscription-colomiers-volley.fr/',
  cookiePath: '/',
  cookieDomain: 'localhost',
  isSecure: true,
  sidenavOpened: true,
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

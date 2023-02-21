export const environment = {
  environment: 'production',
  production: true,
  apiRoot: 'https://localhost:7032/',
  apiUrl: 'https://localhost:7032/api/',
  cookieName: 'ColomiersVolleyNg',
  ssrMode: false,
  basePath: 'https://localhost:4224/',
  basePathSsr: 'https://localhost:4200/',
  cookiePath: '/',
  cookieDomain: 'localhost',
  isSecure: true,
  ssr: {
    serverTimeoutMs: 30000,
    distFolder: 'dist/colomiers-volley/browser',
    stateTransferAppId: 'colomiers-volley'
  }
};

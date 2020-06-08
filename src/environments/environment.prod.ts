export const environment = {
  production: true,
  apiUrl: 'https://api.birminghamurbanobservatory.com',
  audience: 'https://api.birminghamurbanobservatory.com',
  logLevel: 'warn',
  // The following key should be for production only. On the GCP console you should restrict this key to just the domains (*.birminghamurbanobservatory.com/*) where it will be used. Also restrict it to just the Maps JavaScript API (and perhaps also the Geocoding API, which you may need to enable first under "Enable APIs and Services").
  googleMapsApiKey: 'AIzaSyDS-Evzqr-4IPzGWflXDDafglhHV-KTYZQ'
};

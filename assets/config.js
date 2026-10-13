/* Firebase connection — see dashboard/SETUP.md.
   Leave apiKey/projectId empty to run the website and dashboard in demo mode.
   These values are public by design (they ship to every visitor's browser);
   the data is protected by firestore.rules, not by keeping this secret. */
window.APP_CONFIG = {
  firebase: {
    apiKey: "",            // Firebase console → Project settings → Your apps → Web app
    authDomain: "",        // e.g. "community-care-khulna.firebaseapp.com"
    projectId: "",         // e.g. "community-care-khulna"
    appId: ""
  }
};

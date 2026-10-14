/* Firebase connection — see dashboard/SETUP.md.
   Leave apiKey/projectId empty to run the website and dashboard in demo mode.
   These values are public by design (they ship to every visitor's browser);
   the data is protected by firestore.rules, not by keeping this secret. */
window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyB2Gw2bupLDmD8Jk1novRPC11x8yMVQ9IA",
    authDomain: "community-care-khulna.firebaseapp.com",
    projectId: "community-care-khulna",
    appId: "1:358809903266:web:951a34d086dc812209f7fb"
  }
};

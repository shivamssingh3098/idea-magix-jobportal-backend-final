// const admin = require("firebase-admin");
import admin from "firebase-admin";

// const secretAccessKey = require("./firebase-credential.json");
import firebaseSecret from "./firebase-credential.json" assert { type: "json" };
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "mobigic-ffe84",
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,

    client_email: process.env.CLIENT_EMAIL,

    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lt3ww%40mobigic-ffe84.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

const verifyFirebaseToken = async (tokenKey) => {
  try {
    const decodeValue = await admin.auth().verifyIdToken(tokenKey);
    if (decodeValue) {
      return decodeValue;
    }

    return "UnAuthorize";
  } catch (e) {
    console.log("verify firebase token error", e);
    return e;
  }
};
export { verifyFirebaseToken };

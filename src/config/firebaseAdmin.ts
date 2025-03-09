import admin from "firebase-admin";
import serviceAccount from "./creatify-e0a9b-firebase-adminsdk-fbsvc-4f964d8ff4.json"; // Adjust path if needed

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;

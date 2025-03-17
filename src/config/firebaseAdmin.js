"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase_admin_1 = require("firebase-admin");
var creatify_e0a9b_firebase_adminsdk_fbsvc_4f964d8ff4_json_1 = require("./creatify-e0a9b-firebase-adminsdk-fbsvc-83ea9bcd35.json"); // Adjust path if needed
// Initialize Firebase Admin SDK
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(creatify_e0a9b_firebase_adminsdk_fbsvc_4f964d8ff4_json_1.default),
    });
}
exports.default = firebase_admin_1.default;

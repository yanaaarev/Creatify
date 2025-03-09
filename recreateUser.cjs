const admin = require('firebase-admin');
const serviceAccount = require('./src/config/creatify-e0a9b-firebase-adminsdk-fbsvc-4f964d8ff4.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function recreateDeletedUser(uid, email, password, displayName) {
  try {
    const user = await admin.auth().createUser({
      uid: uid,
      email: email,
      password: password,
      displayName: displayName,
    });

    console.log('User recreated successfully:', user.uid);
  } catch (error) {
    console.error('Error recreating user:', error);
  }
}

recreateDeletedUser(
  '12qnEKUCj8buSXlWnAVBqOHGgJe2',
  'dandrebangelitud@gmail.com',
  'Final8yana',
  'Dandreb Angelitud'
);

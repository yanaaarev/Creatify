import admin from "../config/firebaseAdmin";

const makeAdmin = async (email: string): Promise<void> => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log("✅ Found user:", user.uid);

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log("✅ Admin role assigned!");

    // Verify if admin role was set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log("✅ Updated Claims:", updatedUser.customClaims);
  } catch (error) {
    console.error("❌ Error setting admin role:", error);
  }
};

makeAdmin("yannahrevellame@gmail.com");

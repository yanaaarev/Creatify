const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("../config/creatify-e0a9b-firebase-adminsdk-fbsvc-7421c99c62.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// 🔧 Chat ID to update
const chatId = "2IOrZqYCiH1sdTyA7JME";

// 🔧 List of active chat windows per day, with desired message count per window
const activeWindows = [
  { date: "2025-04-10", start: "23:04", end: "23:58", messageCount: 14 },
  { date: "2025-04-14", start: "16:37", end: "17:17", messageCount: 11 },
];

// ⏱️ Time increments per message (minutes)
const increments = [3, 5, 2, 1, 4, 6, 2, 2, 3];

// 🧠 Helper to parse date + time string into Date object
const parseDateTime = (dateStr, timeStr) => {
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const run = async () => {
  const messagesRef = db.collection("chats").doc(chatId).collection("messages");
  const snapshot = await messagesRef.orderBy("timestamp").get();
  const docs = snapshot.docs;

  if (!docs.length) {
    console.log("❌ No messages found for chat:", chatId);
    return;
  }

  let allMessages = [...docs];
  let messageIndex = 0;
  let lastUsedTimestamp = null;

  for (let window of activeWindows) {
    const { date, start, end, messageCount } = window;
    let currentTime = parseDateTime(date, start);
    const endTime = parseDateTime(date, end);

    console.log(`🗓️ Processing window: ${date} (${start} - ${end}) → ${messageCount} message(s)`);

    for (let i = 0; i < messageCount; i++) {
      if (messageIndex >= allMessages.length) {
        console.log("🚫 No more messages to update.");
        break;
      }

      if (currentTime > endTime) {
        console.log(`⚠️ Ran out of time in window ${date}. Only updated ${i} of ${messageCount}`);
        break;
      }

      const increment = increments[messageIndex % increments.length];
      const doc = allMessages[messageIndex];
      const timestamp = Timestamp.fromDate(new Date(currentTime));

      await doc.ref.update({ timestamp });
      console.log(`✅ Updated ${doc.id} → ${currentTime.toLocaleString()}`);

      lastUsedTimestamp = timestamp;
      currentTime.setMinutes(currentTime.getMinutes() + increment);
      messageIndex++;
    }
  }

  if (lastUsedTimestamp) {
    await db.collection("chats").doc(chatId).update({
      lastMessageTimestamp: lastUsedTimestamp,
    });
    console.log(`📌 Updated lastMessageTimestamp → ${lastUsedTimestamp.toDate().toLocaleString()}`);
  }

  console.log("🎉 Finished updating messages per custom active windows.");
};

run().catch(console.error);

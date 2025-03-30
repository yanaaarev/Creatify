import { collection, addDoc, doc, updateDoc, query, where, orderBy, onSnapshot, Timestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import uploadToCloudinary from "./uploadtoCloudinary";
import { triggerNotification } from "../utils/triggerNotification"; // ✅ Import triggerNotification
import { logEvent } from "firebase/analytics";
import { analytics } from "../config/firebaseConfig";

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

export const listenForChats = (userId: string, setChats: Function) => {
  console.log("🔥 Listening for chats for user:", userId);

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("users", "array-contains", userId), orderBy("lastMessageTimestamp", "desc"));

  return onSnapshot(q, async (snapshot) => {
    const chats = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const chatData = docSnap.data();
        const chatId = docSnap.id;

        let clientUsername = "Unknown User";
        let artistName = "Unknown Artist";
        let avatarUrl = DEFAULT_AVATAR_URL; // ✅ Default avatar URL
        let lastMessage = chatData.lastMessage || "No messages yet";
        let isOnline = false; // ✅ Default: Assume offline
        let isUnread = chatData.unreadStatus?.[userId] || false;

        // 🔹 Fetch Client Data from "users" Collection
        if (chatData.clientId) {
          const clientRef = doc(db, "users", chatData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            const clientData = clientSnap.data();
            clientUsername = `@${clientData.username}`;
            if (userId === chatData.artistId) {
              avatarUrl = clientData.avatar || DEFAULT_AVATAR_URL;
            }
          }
        }

        // 🔹 Fetch Artist Data from "artists" Collection & Check Online Status
        if (chatData.artistId) {
          const artistRef = doc(db, "artists", chatData.artistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            const artistData = artistSnap.data();
            artistName = artistData.fullName || artistData.displayName || "Unknown Artist";
            if (userId === chatData.clientId) {
              avatarUrl = artistData.profilePicture || artistData.avatar || DEFAULT_AVATAR_URL;
            }

            // ✅ Fetch Online Status for Artists Only
            isOnline = artistData.isOnline || false;
          }
        }

        return {
          id: chatId,
          clientId: chatData.clientId,
          artistId: chatData.artistId,
          clientUsername,
          artistName,
          avatarUrl,
          lastMessage,
          lastMessageTimestamp: chatData.lastMessageTimestamp,
          isOnline, // ✅ Add Online Status (Only for Artists)
          isUnread,
        };
      })
    );

    console.log("✅ Retrieved Chats:", chats);
    setChats(chats);
  }, (error) => {
    console.error("❌ Error fetching chat list:", error);
  });
};


  

export const listenForMessages = (chatId: string, setMessages: Function) => {
  if (!chatId) return () => {}; // ✅ Ensure chatId exists

  const messagesRef = collection(db, `chats/${chatId}/messages`); // ✅ Fixed incorrect path
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        content: data.content || "", // ✅ Prevent empty content errors
        attachmentUrl: data.attachmentUrl || null, // ✅ Ensure attachmentUrl exists
        paymentId: data.paymentId || null, // ✅ Fetch the payment ID
        type: data.type || "text", // ✅ Fetch the type of message (default to text)
        timestamp: data.timestamp,
      };
    });
  
    setMessages(messages);
  });
};

export type AttachmentType = 
  | File 
  | string 
  | { type: "payment-request"; paymentId: string };

export const sendMessage = async (chatId: string, content: string, attachment?: AttachmentType) => {
  try {
    if (!auth.currentUser?.uid) throw new Error("User is not authenticated.");

    const senderId = auth.currentUser.uid;
    let attachmentUrl: string | null = null;
    let paymentId: string | null = null;
    let messageType: "text" | "image" | "payment-request" = "text";

    if (typeof attachment === "string") {
      attachmentUrl = attachment;
      messageType = "image"; // ✅ If it's a string, it's an image URL
    } else if (attachment instanceof File) {
      attachmentUrl = await uploadToCloudinary(attachment, "message_attachments");
      messageType = "image";
    } else if (typeof attachment === "object" && attachment.type === "payment-request") {
      paymentId = attachment.paymentId;
      messageType = "payment-request";
    }

    console.log("🔥 Sending message from:", senderId, "in chat:", chatId);

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.error("❌ Chat document does NOT exist! Cannot send message.");
      return;
    }

    const chatData = chatSnap.data();
    const recipientId = chatData.clientId === senderId ? chatData.artistId : chatData.clientId;

    if (!recipientId || recipientId === senderId) {
      console.warn("⚠️ No valid recipient found or trying to notify the sender.");
      return; // ✅ Prevent sending notifications to the sender
    }

    const messagesRef = collection(db, `chats/${chatId}/messages`);

    // ✅ Prepare message object
    const messageData: any = {
      senderId,
      content: messageType === "payment-request" ? "[Payment Request]" : content,
      attachmentUrl: attachmentUrl || null,
      paymentId: paymentId || null,
      type: messageType,
      timestamp: Timestamp.now(),
    };

    // ✅ Send message to Firestore
    const newMessage = await addDoc(messagesRef, messageData);
    console.log("✅ Message sent successfully:", newMessage.id);

    // ✅ Update last message in the chat
    await updateDoc(chatRef, {
      lastMessage: messageType === "payment-request" ? "[Payment Request]" : content || "[Image]",
      lastMessageTimestamp: Timestamp.now(),
      [`unreadStatus.${recipientId}`]: true,
    });

     // ✅ Track message sent in Firebase Analytics
     logEvent(analytics, "message_sent", {
      chat_id: chatId,
      sender_id: senderId,
      recipient_id: recipientId,
      message_type: messageType,
    });

    // ✅ Trigger Notification ONLY for the recipient
    await triggerNotification("new_message", {
      recipientId,
      artistId: chatData.artistId,
      clientId: chatData.clientId,
      artistName: chatData.artistName || "Unknown Artist",
      clientUsername: chatData.clientUsername || "@unknown_user",
      bookingId: chatId,
      senderId: senderId,
      timestamp: Timestamp.now(),
    });

  } catch (error) {
    console.error("❌ Error sending message:", error);
    alert("Failed to send message. Please try again.");
  }
};

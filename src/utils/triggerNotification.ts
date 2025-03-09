import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export type NotificationType =
  | "new_message"
  | "cancelled"
  | "active"
  | "booking-request"
  | "payment-request"
  | "payment"
  | "payment-verified"
  | "completed"
  | "feedback"
  | "on-hold";

interface BookingData {
  artistId: string;
  clientId: string;
  artistName?: string;
  bookingId: string;
  timestamp?: Timestamp;
  clientUsername?: string;
  senderId: string;
  avatarUrl?: string;
  recipientId?: string;
}

const admin = {
  avatar: '@/assets/creatify_favicon.png', // replace with the actual avatar URL
  // other admin properties...
};

// ✅ Helper function to get user details
const getUserDetails = async (userId: string, isArtist: boolean): Promise<{ name: string; avatar: string }> => {
  try {
    const userRef = isArtist ? doc(db, "artists", userId) : doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const name = isArtist ? data.fullName || data.displayName || data.username : `@${data.username}`;
      const avatar = isArtist ? data.profilePicture || "/default-avatar.png" : data.avatar || data.avatarUrl || "/default-avatar.png";
      return { name, avatar };
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
  return { name: "Unknown User", avatar: "/default-avatar.png" };
};

// ✅ Function to trigger notifications
export const triggerNotification = async (type: NotificationType, bookingData: BookingData): Promise<void> => {
  const { artistId, clientId, bookingId, senderId } = bookingData;
  try {
    const notificationsRef = collection(db, "notifications");

    const artist = await getUserDetails(artistId, true);
    const client = await getUserDetails(clientId, false);

    // ✅ Helper function to add a notification
    const addNotification = async (recipientId: string, message: string, avatar: string, title: string = "") => {
      await addDoc(notificationsRef, {
        recipientId,
        title,
        message,
        timestamp: Timestamp.now(),
        bookingId,
        avatarUrl: avatar,
        senderId,
        type,
      });
    };

    switch (type) {
      case "new_message":
        const recipientId = senderId === clientId ? artistId : clientId;
        if (!recipientId || recipientId === senderId) {
          console.warn("⚠️ Prevented self-notification.");
          return;
        }
        await addNotification(
          recipientId,
          `You have a new message from <b>${senderId === clientId ? client.name : artist.name}</b>. Click to view and reply.`,
          senderId === clientId ? client.avatar : artist.avatar,
          "New Message!"
        );
        break;

      case "cancelled":
        await addNotification(artistId, `The booking with <b>${client.name}</b> has been canceled. Check your dashboard for updates.`, client.avatar, "Booking Cancelled");
        await addNotification(clientId, `Your booking with <b>${artist.name}</b> has been canceled. We hope to assist you again soon!`, artist.avatar, "Booking Cancelled");
        break;

      case "active":
        await addNotification(artistId, `The booking with <b>${client.name}</b> is now in progress. Prepare to work on the project.`, client.avatar, "Booking in Progress");
        await addNotification(clientId, `Your commission with <b>${artist.name}</b> is now in progress. Stay updated in your dashboard.`, artist.avatar, "Booking in Progress");
        break;

      case "booking-request":
        await addNotification(artistId, `You have a pending request from <b>${client.name}</b>. Review and accept in your dashboard.`, client.avatar, "New Booking Request!");
        await addNotification(clientId, `Your booking with <b>${artist.name}</b> is pending approval. You’ll be notified once it’s accepted.`, artist.avatar, "Booking Request Sent!");
        break;

      case "payment-request":
        await addNotification(artistId, `You've successfully sent a payment request to <b>${client.name}</b>. Kindly wait for their proof of payment.`, client.avatar, "Payment Request Sent!");
        await addNotification(clientId, `<b>${artist.name}</b> just sent a payment request for your commission. Please review and proceed with the payment.`, artist.avatar, "Payment Request Sent!");
        break;

        case "payment-verified":
        await addNotification(clientId, `Your payment has been successfully verified by the admin. Thank you for your transaction!`, admin.avatar, "Payment Verified!");
        await addNotification(artistId, `<b>${client.name}</b>'s payment for the commission has been verified. You may now proceed with the next steps.`, admin.avatar, "Payment Verified!");
        break;


      case "payment":
        await addNotification(artistId, `Payment received from <b>${client.name}</b>. Check the payment confirmation in your messages.`, client.avatar, "Payment Received!");
        await addNotification(clientId, `Your proof of payment has been submitted. Thanks for trusting us, <b>${client.name}</b>!`, artist.avatar, "Payment Submitted!");
        break;

      case "completed":
        await addNotification(artistId, `Great job! The commissioned artwork for <b>${client.name}</b> is now marked as complete.`, client.avatar, "Booking Completed!");
        await addNotification(clientId, `Your commissioned artwork is complete! Please review it and share your feedback with <b>${artist.name}</b>.`, artist.avatar, "Booking Completed!");
        break;

      case "feedback":
        await addNotification(artistId, `You have received new feedback from <b>${client.name}</b>. Check your testimonials page to view.`, client.avatar, "New Feedback!");
        await addNotification(clientId, `You have successfully left feedback for <b>${artist.name}</b> Thank you for sharing your experience!`, artist.avatar, "Leave a Feedback!");
        break;

      case "on-hold":
        await addNotification(artistId, `You’ve put this commission on hold. <b>${client.name}</b> has been notified.`, client.avatar, "Booking On-Hold");
        await addNotification(clientId, `Your booking is on hold. Wait for <b>${artist.name}</b> for an update.`, artist.avatar, "Booking On-Hold");
        break;

      default:
        console.error("Unknown notification type.");
        break;
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

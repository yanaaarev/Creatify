import { useEffect, useState, useRef } from "react";
import { collection, query, where, onSnapshot, updateDoc, getDoc, doc, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "./config/firebaseConfig";
import { FaBell, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { triggerNotification } from "./utils/triggerNotification";
import { writeBatch } from "firebase/firestore"; // ✅ Import writeBatch
import { ClipLoader } from "react-spinners";

import creatifyFavicon from "/images/creatifyadmin.webp";
import newMessageIcon from "/images/notificationtype/new_message.webp";
import activeIcon from "/images/notificationtype/active.webp";
import cancelledIcon from "/images/notificationtype/cancelled.webp";
import onHoldIcon from "/images/notificationtype/on-hold.webp";
import bookingRequestIcon from "/images/notificationtype/booking-request.webp";
import completedIcon from "/images/notificationtype/completed.webp";
import paymentIcon from "/images/notificationtype/payment.webp";
import feedbackIcon from "/images/notificationtype/feedback.webp";

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

interface Notification {
  id: string;
  title: string;
  message?: string;
  isRead: boolean;
  avatarUrl?: string;
  timestamp: { seconds: number; nanoseconds: number };
  recipientId: string;
  type: string;  // <-- Add this line
  senderId?: string;
  bookingId?: string;
  clientId?: string;
  artistId?: string;
  chatId?: string;
  paymentId?: string;
}

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ artistId?: string; bookingId?: string }>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [userRole, setUserRole] = useState<string>(''); // Initialize userRole as an empty string
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(collection(db, "notifications"), where("recipientId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Notification;
          return {
            ...data,  // Spread all other properties
            id: docSnap.id,  // Manually assign the id here
          };
        })
        .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);  // Sort by timestamp descending
    
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !n.isRead).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = doc(db, "notifications", id);
      await updateDoc(notificationRef, { isRead: true });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };
  const markAllAsRead = async () => {
    try {
      if (!auth.currentUser) {
        console.error("❌ No authenticated user found.");
        return;
      }
  
      const userId = auth.currentUser.uid;
      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(notificationsRef, where("recipientId", "==", userId));
  
      const notificationsSnap = await getDocs(notificationsQuery);
  
      if (notificationsSnap.empty) {
        console.log("✅ No notifications found.");
        return;
      }
  
      const batch = writeBatch(db);
      let unreadExists = false; // ✅ Track if there are unread notifications
  
      notificationsSnap.forEach((docSnap) => {
        const notifData = docSnap.data();
        if (!notifData.isRead) {
          unreadExists = true; // ✅ Found at least one unread notification
          const notifRef = doc(db, "notifications", docSnap.id);
          batch.update(notifRef, { isRead: true });
        }
      });
  
      if (!unreadExists) {
        console.log("✅ No unread notifications to mark.");
        return;
      }
  
      await batch.commit();
      console.log("✅ All notifications marked as read.");
  
      // 🔄 Update state without navigating
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0); // Reset unread count
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error);
    }
  };
  
  const startNewChat = async (participantId: string, userRole: string) => {
    if (!auth.currentUser) {
      alert("You need to be logged in!");
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const isArtist = userRole === "artist";
    const artistId = isArtist ? currentUserId : participantId;
    const clientId = isArtist ? participantId : currentUserId;

    try {
      if (!artistId || !clientId) {
        console.error("❌ Missing required IDs:", { artistId, clientId });
        alert("An error occurred. Please try again.");
        return;
      }

      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("users", "array-contains", currentUserId));
      const chatSnapshot = await getDocs(q);

      let existingChat: { id: string; users: string[] } | null = null;

      chatSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as { users: string[] };
        if (data?.users?.includes(participantId)) {
          existingChat = { id: docSnapshot.id, users: data.users };
        }
      });

      if (existingChat) {
        handleNavigate(`/messages/${(existingChat as { id: string; users: string[] }).id}`);
        return;
      }

      const newChatRef = await addDoc(collection(db, "chats"), {
        users: [artistId, clientId],
        artistId,
        clientId,
        lastMessage: "",
        lastMessageTimestamp: null,
      });

      handleNavigate(`/messages/${newChatRef.id}`);
    } catch (error) {
      console.error("❌ Error starting chat:", error);
      alert("Failed to start a chat. Please try again.");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      console.log("🔔 Notification Clicked:", notification);
      
      await markAsRead(notification.id);
  
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("❌ No current user found.");
        return;
      }
  
      let userData = null;
      let role = ""; // Default role
  
      // 🔥 Fetch User Role First
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userData = userSnap.data();
        role = userData.role;
      } else {
        const artistRef = doc(db, "artists", currentUser.uid);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          userData = artistSnap.data();
          role = userData.role;
        } else {
          console.error("❌ User data not found.");
          return;
        }
      }
  
      setUserRole(role); // ✅ Store user role
  
      const senderId = notification.senderId;
  
      // 🔥 Fix: Ensure correct `clientId` and `artistId`
      let clientId = notification.clientId || (role === "artist" ? senderId : currentUser.uid);
      let artistId = notification.artistId || (role === "client" ? senderId : currentUser.uid);
      let bookingId = notification.bookingId || "Unknown"; // Ensure bookingId fallback
  
      console.log("📌 User Role:", role);
      console.log("📌 Notification Type:", notification.type);
      console.log("📌 Derived Values -> clientId:", clientId, "| artistId:", artistId, "| bookingId:", bookingId);
  
      if (notification.type === "new_message") {
        if (clientId && artistId) {
          console.log("✅ Starting chat between Client:", clientId, "and Artist:", artistId);
          await startNewChat(clientId, role);
        } else {
          console.error("❌ Still missing clientId or artistId in notification:", notification);
          alert("This notification is missing required details.");
        }
      } 
      // ✅ Fix: Handle Booking Completed Feedback (Only Clients)
      else if (notification.title.includes("Booking Completed") && role === "client") {
        console.log("📌 Triggering feedback form for completed booking.");
  
        // 🔥 Ensure artistId is retrieved from Firestore if missing
        if (!artistId || artistId === "Unknown") {
          console.warn("⚠️ Artist ID missing, attempting to retrieve from Firestore...");
  
          try {
            const bookingRef = doc(db, "bookings", notification.bookingId ?? "");
            const bookingSnap = await getDoc(bookingRef);
  
            if (bookingSnap.exists()) {
              const bookingData = bookingSnap.data();
              artistId = bookingData?.artistId || "Unknown";
              console.log("✅ Retrieved artistId from Firestore:", artistId);
            } else {
              console.error("❌ Booking not found.");
              alert("Error: Booking data not found. Please try again.");
              return;
            }
          } catch (error) {
            console.error("❌ Error retrieving artistId from Firestore:", error);
            alert("An error occurred. Please try again.");
            return;
          }
        }
  
        // ✅ Fix: Ensure Feedback Overlay Opens
        setShowFeedbackForm(true);
        setShowThankYou(false); // ✅ Reset Thank You Overlay when opening the feedback form
        setFeedbackData({
          artistId,
          bookingId: notification.bookingId || "Unknown",
        });
  
        return; // ✅ Prevent navigation
      }
      // ✅ Booking Notifications (Now for Both Clients and Artists)
    else if (notification.title.includes("Booking")) {
      console.log("🔄 Navigating to Booking Page");

      if (bookingId !== "Unknown") {
        handleNavigate(`/client-booking/${bookingId}`); // ✅ Both Clients and Artists go to booking details
      } else {
        console.warn("⚠️ Missing bookingId, navigating to default dashboard.");
        handleNavigate(role === "artist" ? "/request-dashboard" : "/user-dashboard"); // ✅ Fallback
      }
    } 
   // ✅ Feedback Notifications
else if (notification.title.includes("Feedback")) {
  console.log("🔄 Navigating to Feedback Page");

  if (role === "artist") {
    handleNavigate("/artist-dashboard"); // ✅ Artists go to their dashboard
  } else if (role === "client") {
    let correctArtistId = null; // Ensure we start without an incorrect ID

    try {
      if (notification.bookingId) {
        console.log("📌 Fetching artistId from FEEDBACK using bookingId:", notification.bookingId);

        // ✅ Query `feedback` where `bookingId` matches
        const feedbackQuery = query(
          collection(db, "feedback"),
          where("bookingId", "==", notification.bookingId)
        );
        const feedbackSnap = await getDocs(feedbackQuery);

        feedbackSnap.forEach((docSnap) => {
          const feedbackData = docSnap.data();
          if (feedbackData.artistId && feedbackData.artistId !== notification.clientId) {
            correctArtistId = feedbackData.artistId;
            console.log("✅ Correct artistId retrieved from Feedback:", correctArtistId);
          }
        });
      }

      // 🔄 Ensure a valid `artistId` was found
      if (correctArtistId && correctArtistId !== notification.clientId) {
        console.log("🚀 Navigating to Artist Profile:", `/artist-profile/${correctArtistId}`);
        handleNavigate(`/artist-profile/${correctArtistId}`);
      } else {
        console.warn("⚠️ Artist ID not found in feedback, navigating to homepage.");
        handleNavigate("/"); // ✅ Fallback to homepage if missing
      }
    } catch (error) {
      console.error("❌ Error fetching artistId from FEEDBACK:", error);
      handleNavigate("/"); // ✅ Fallback to homepage if error occurs
    }
  }
}
  } catch (error) {
    console.error("❌ Error handling notification click:", error);
  }
};
  

  const submitFeedback = async () => {
    if (!feedback.trim() || rating === 0) {
      alert("❌ Please provide feedback and a rating.");
      return;
    }
  
    const clientId = auth.currentUser?.uid;
    if (!clientId) {
      console.error("❌ Cannot submit feedback: Missing clientId.");
      alert("Error: Authentication issue. Please log in again.");
      return;
    }
  
    if (!feedbackData.bookingId) {
      console.error("❌ Cannot submit feedback: Missing bookingId.");
      alert("Error: Missing booking details. Please try again.");
      return;
    }
  
    // 🔥 Ensure artistId exists
    if (!feedbackData.artistId) {
      console.warn("⚠️ Missing artistId, retrieving from Firestore...");
      try {
        const bookingRef = doc(db, "bookings", feedbackData.bookingId);
        const bookingSnap = await getDoc(bookingRef);
  
        if (bookingSnap.exists()) {
          feedbackData.artistId = bookingSnap.data()?.artistId || null;
        }
      } catch (error) {
        console.error("❌ Error retrieving artistId:", error);
        alert("An error occurred. Please try again.");
        return;
      }
    }
  
    if (!feedbackData.artistId) {
      console.error("❌ Unable to retrieve artistId.");
      alert("Error: Artist details missing. Please try again.");
      return;
    }

    setButtonLoading(true);

    const clientRef = doc(db, "users", clientId);
    const clientSnap = await getDoc(clientRef);

    const username = clientSnap.exists() ? clientSnap.data()?.username || "Anonymous" : "Anonymous";
  
    console.log("📌 Submitting Feedback with Data:", {
      artistId: feedbackData.artistId,
      bookingId: feedbackData.bookingId,
      clientId,
      username,
      rating,
      comment: feedback.trim(),
      date: Timestamp.now(),
    });
  
    try {
      await addDoc(collection(db, "feedback"), {
        artistId: feedbackData.artistId,
        bookingId: feedbackData.bookingId,
        clientId, // 🔥 Ensure `clientId` is included
        username,
        rating,
        comment: feedback.trim(),
        date: Timestamp.now(),
      });

       // ✅ Fetch Artist Details for Notification
       const artistRef = doc(db, "artists", feedbackData.artistId);
       const artistSnap = await getDoc(artistRef);
       const artistData = artistSnap.exists() ? artistSnap.data() : null;

       if (!artistData) {
           console.warn("⚠️ Artist details not found for notification.");
       }

       // ✅ Trigger Notification for Artist
       await triggerNotification("feedback", {
           artistId: feedbackData.artistId,
           clientId,
           artistName: artistData?.fullName || "Unknown Artist",
           clientUsername: username,
           bookingId: feedbackData.bookingId,
           senderId: clientId,
           avatarUrl: artistData?.profilePicture || DEFAULT_AVATAR_URL,
           timestamp: Timestamp.now(),
       });
  
      alert("✅ Feedback submitted successfully!");
      setButtonLoading(false); // ✅ Show loading state
      setShowFeedbackForm(false);
      setShowThankYou(true);
      setFeedback("");
      setRating(0);
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      alert("❌ Failed to submit feedback. Please try again.");
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_message":
        return newMessageIcon;
      case "active":
        return activeIcon;
      case "cancelled":
        return cancelledIcon;
      case "on-hold":
        return onHoldIcon;
      case "booking-request":
        return bookingRequestIcon;
      case "completed":
        return completedIcon;
        case "payment-request":
        return paymentIcon;
      case "payment":
        return paymentIcon;
      case "feedback":
        return feedbackIcon;
      default:
        return null;
    }
  };
  
  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false); // ✅ Close the dropdown when clicking outside
      }
    };
  
    // ✅ Attach event listener to close dropdown
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  
  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };


  return (
    <div className="relative">
        <div className="cursor-pointer" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          setShowDropdown((prev) => !prev);
        }}
      >
        <FaBell className="text-white text-[28px]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2">
            {unreadCount}
          </span>
        )}
      </div>

  {showDropdown && (
    <div ref={dropdownRef} className="absolute right-0 md:right-0 mt-2 w-[75vw] md:w-[450px] bg-white shadow-lg rounded-lg p-4 z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
    {/* ✅ Header with "Mark All as Read" Button */}
    <div className="flex justify-between items-center pb-2">
      <h3 className="text-lg font-semibold">Notifications</h3>
      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          className="text-blue-500 text-xs hover:underline mt-1"
        >
          Mark All as Read
        </button>
      )}
    </div>
    {notifications.length > 0 ? (
      notifications.map((notif, index) => (
        <div key={notif.id}>
          <div
            className={`flex items-start p-2 ${notif.isRead ? "bg-gray-100" : "bg-blue-100"} rounded cursor-pointer`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div className="relative w-[65px] h-[65px] md:w-[80px] md:h-[80px] mt-2 flex-shrink-0">
            <img
              src={notif.avatarUrl || creatifyFavicon}
              alt="User Avatar"
              onError={(e) => (e.currentTarget.src = creatifyFavicon)}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
                {getNotificationIcon(notif.type) && (
                  <img
                    src={getNotificationIcon(notif.type) || creatifyFavicon}
                    alt="Notification Type Icon"
                    className="absolute bottom-0 right-0 w-[20px] h-[20px] md:w-[30px] md:h-[30px] rounded-full border-2 border-white bg-white"
                  />
                )}
              </div>

              <div className="gap-2 ml-3 flex flex-col">
                <p className="text-sm text-black">
                  <span className="[font-family:'Khula',Helvetica] font-bold text-sm">{notif.title}</span>
                </p>
                {notif.message && (
                  <p
                    className="[font-family:'Khula',Helvetica] text-black text-sm font-medium"
                    dangerouslySetInnerHTML={{ __html: notif.message }}
                  />
                )}

                <small className="text-gray-500 text-xs">
                  {new Date(notif.timestamp.seconds * 1000).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </small>
              </div>
            </div>
            {index < notifications.length - 1 && <hr className="my-2 border-gray-500" />}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No new notifications.</p>
      )}
    </div>
  )}
  
  {showFeedbackForm && userRole === "client" && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 min-h-screen">
      
      {/* ✅ Close Button */}
    <button
                className="absolute top-4 right-4 text-white text-4xl"
                onClick={() => setShowFeedbackForm(false)}
            >
                ✖
            </button>

    <div className="bg-white px-11 md:px-16 py-16 md:py-20 rounded-[30px] shadow-lg w-full max-w-[600px] h-full max-h-[350px] mx-auto">
      
      {/* Feedback Heading */}
      <p className="text-center text-black font-normal">
        Thanks for choosing <span className="font-bold">Creatify!</span> Would you mind leaving a quick review and rating for the artist? Your feedback helps them grow!
      </p>

      {/* Star Rating */}
      <div className="flex justify-center mt-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-xl ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      {/* Feedback Input */}
<textarea
  className="w-full mt-4 mb-1 px-4 py-3 border border-black rounded-full text-gray-600 text-sm resize-none overflow-hidden"
  placeholder="Leave a comment"
  value={feedback}
  onChange={(e) => {
    setFeedback(e.target.value);
    e.target.style.height = "auto"; // Reset height to calculate new height
    e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
  }}
  rows={1} // Start with a single row
  style={{ maxHeight: "50px" }} // ✅ Set maximum height
/>

      {/* Submit Button */}
      <button
        onClick={submitFeedback}
        disabled={buttonLoading}
        className="bg-[#7DB23A] text-white px-4 py-2 rounded-full mt-2 w-full text-lg font-semibold"
      >
        {buttonLoading ? <ClipLoader size={20} color="white" /> : "Submit"}
      </button>
      
    </div>
  </div>
)}

{/* ✅ Second Overlay after pressing Send button */}
{showThankYou && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 min-h-screen">
    <div className="bg-white px-6 py-16 rounded-[30px] shadow-lg w-full max-w-[600px] h-[200px] mx-auto text-center">
      <p className="text-black font-normal">
        We appreciate you taking the time to share your thoughts with us!
      </p>
      <button
        onClick={() => setShowThankYou(false)}
        className="bg-[#7DB23A] text-white px-4 py-2 rounded-full mt-4 w-full max-w-[480px] text-lg font-semibold"
      >
        Back to Homepage
      </button>
    </div>
  </div>
)}


</div>
  );
};

export default NotificationComponent;

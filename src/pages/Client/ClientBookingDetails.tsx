import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { auth } from "../../config/firebaseConfig"; // Already imported db
import ArtistCalendar from "../Artist/ArtistCalendar";
import authp from "../../assets/authp.png";
import { triggerNotification, NotificationType } from "../../utils/triggerNotification";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { Timestamp } from "firebase/firestore"; 

const ClientBookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [, setSelectedStatus] = useState<string | null>(null);
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || typeof bookingId !== "string") {
          console.error("❌ Error: Booking ID is missing or invalid.");
          navigate("/user-dashboard");
          return;
      }
  
      try {
          const bookingRef = doc(db, "bookings", bookingId);
          const bookingSnap = await getDoc(bookingRef);
  
          if (!bookingSnap.exists()) {
              console.error("❌ Booking not found in Firestore.");
              navigate("/user-dashboard");
              return;
          }
  
          const data = bookingSnap.data();
          let paymentVerified = false;
  
          // ✅ Check if `paymentId` exists in the booking
          if (data.paymentId) {
              try {
                  const paymentRef = doc(db, "payments", data.paymentId);
                  const paymentSnap = await getDoc(paymentRef);
  
                  if (paymentSnap.exists() && paymentSnap.data().paymentStatus === "verified") {
                      paymentVerified = true;
                  }
              } catch (paymentError) {
                  console.error("❌ Error fetching payment:", paymentError);
              }
          }
  
          setBooking({
              ...data,
              paymentVerified, // ✅ Store payment verification status
          });
  
          console.log("✅ Booking fetched with Payment Verification Status:", paymentVerified);
  
         // ✅ Fix 24-hour Cancellation Window Logic
      if (data.createdAt?.seconds) {
        const createdAtUTC = new Date(data.createdAt.seconds * 1000);
        const nowUTC = new Date();

        // ✅ Convert Manila time properly using Date constructor
        const createdAtManila = new Date(createdAtUTC.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        const nowManila = new Date(nowUTC.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

        const timeDifference = nowManila.getTime() - createdAtManila.getTime();
        console.log("⏳ Time Difference (ms):", timeDifference, "⏳ 24h Limit (ms):", 24 * 60 * 60 * 1000);

        // ✅ Fix: Ensure correct 24-hour comparison
        setCanCancel(timeDifference < 24 * 60 * 60 * 1000);
      }
      } catch (error) {
          console.error("❌ Error fetching booking:", error);
      } finally {
          setLoading(false);
      }
  };
  
  fetchBooking();
  }, [bookingId, navigate]);
  

const startChatWithClient = async (clientId: string) => {
      if (!auth.currentUser) return alert("You need to be logged in!");
    
      const artistId = auth.currentUser.uid;
    
      try {
        // ✅ Check if chat already exists
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("users", "array-contains", artistId));
        const chatSnapshot = await getDocs(q);
    
        let existingChat: { id: string; users: string[] } | null = null; // ✅ Ensure correct type
    
        chatSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as { users: string[] }; // ✅ Ensure correct type
          if (data.users.includes(clientId)) {
            existingChat = { id: docSnapshot.id, users: data.users }; // ✅ Assign correct structure
          }
        });
    
        if (existingChat !== null) { 
          // ✅ TypeScript now knows existingChat is not null, so accessing .id is safe
          navigate(`/messages/${(existingChat as { id: string }).id}`);
          return; // 🚀 Ensure early return to prevent unnecessary execution
        }
    
        // ✅ Otherwise, create a new chat
        const newChatRef = await addDoc(collection(db, "chats"), {
          users: [artistId, clientId], // ✅ Store both user IDs
          artistId,
          clientId,
          lastMessage: "",
          lastMessageTimestamp: null,
        });
    
        // ✅ Navigate to the newly created chat
        navigate(`/messages/${newChatRef.id}`);
      } catch (error) {
        console.error("Error starting chat:", error);
        alert("Failed to start a chat. Please try again.");
      }
    };

// ✅ Function to fetch client username
const getClientUsername = async (clientId: string): Promise<string> => {
  const userRef = doc(db, "users", clientId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return `@${userData.username}`;
  }
  return "@unknown_user";
};

const getArtistDetails = async (artistId: string): Promise<{ fullName: string; avatar: string }> => {
  const userRef = doc(db, "artists", artistId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return { fullName: userData.fullName || "Unknown Artist", avatar: userData.avatar || "/default-avatar.png" };
  }
  return { fullName: "Unknown Artist", avatar: "/default-avatar.png" };
};

const handleConfirmUpdateStatus = async (newStatus: string) => {
  if (!bookingId) return;

  // 🔹 Prevent "Completed" if payment is not verified
  if (newStatus === "completed") {
    try {
      console.log("🔍 Checking payment verification for booking:", bookingId);

      // ✅ Step 1: Fetch the booking document
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        console.warn("⚠ Booking not found.");
        alert("Booking not found. Cannot mark as completed.");
        return;
      }

      const bookingData = bookingSnap.data();
      if (!bookingData?.paymentId) {
        console.warn("⚠ No payment linked to this booking.");
        alert("No payment found for this booking. Cannot mark as completed.");
        return;
      }

      // ✅ Step 2: Fetch the payment document using paymentId from booking
      const paymentRef = doc(db, "payments", bookingData.paymentId);
      const paymentSnap = await getDoc(paymentRef);

      if (!paymentSnap.exists()) {
        console.warn("⚠ Payment document does not exist.");
        alert("Payment details not found. Cannot mark as completed.");
        return;
      }

      const paymentData = paymentSnap.data();
      const paymentVerified = paymentData.paymentStatus === "verified";
      const paymentType = paymentData.paymentType;

      // ✅ Update the booking state with payment info for UI updates
      setBooking((prev: any) => ({
        ...prev,
        paymentType,
        paymentVerified,
      }));

      // ✅ Check if payment type is "Full Payment" and requires verification
      if (paymentData.paymentType === "Full Payment" && paymentData.paymentStatus !== "verified") {
        console.warn("❌ Payment is not verified yet.");
        alert("Payment is not verified. You cannot mark this booking as completed.");
        return;
      }

      console.log("✅ Payment verified! Allowing completion.");
    } catch (error) {
      console.error("❌ Error checking payment verification:", error);
      alert("Something went wrong. Please try again.");
      return;
    }
  }

  // 🔹 Confirm before updating status
  const userConfirmed = window.confirm(`Are you sure you want to update the booking status to ${newStatus.toUpperCase()}?`);
  if (!userConfirmed) return;

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    setBooking((prev: any) => ({ ...prev, status: newStatus, updatedAt: Timestamp.now() }));
    setShowStatusMenu(false);
    setSelectedStatus(null);
    alert(`Booking status updated to ${newStatus.toUpperCase()} successfully!`);

    // ✅ Send notifications
    const clientUsername = await getClientUsername(booking?.clientId);
    const artistDetails = await getArtistDetails(booking?.artistId);

    await triggerNotification(newStatus as NotificationType, {
      artistId: booking?.artistId,
      clientId: booking?.clientId,
      artistName: artistDetails.fullName,
      clientUsername,
      bookingId,
      senderId: auth.currentUser?.uid || "",
      avatarUrl: artistDetails.avatar,
      timestamp: Timestamp.now(),
    });

    window.location.reload();
  } catch (error) {
    console.error("❌ Error updating status:", error);
    alert("Failed to update booking status. Please try again.");
  }
};

const handleUpdateStatus = async (newStatus: string) => {
  if (!bookingId) return;

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    setBooking((prev: any) => ({ ...prev, status: newStatus, updatedAt: Timestamp.now() }));
    setShowStatusMenu(false);
    alert(`Booking status updated to ${newStatus.toUpperCase()} successfully!`);

    const clientUsername = await getClientUsername(booking?.clientId);
    const artistDetails = await getArtistDetails(booking?.artistId);

    await triggerNotification(newStatus as NotificationType, {
      artistId: booking?.artistId,
      clientId: booking?.clientId,
      artistName: artistDetails.fullName,
      clientUsername,
      bookingId,
      senderId: auth.currentUser?.uid || "",
      avatarUrl: artistDetails.avatar,
      timestamp: Timestamp.now(),
    });

    window.location.reload();
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update booking status. Please try again.");
  }
};


const handleCancelBooking = async () => {
  if (!bookingId) {
    alert("Invalid booking ID.");
    return;
  }

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      alert("Booking not found.");
      navigate("/user-dashboard");
      return;
    }

    const bookingData = bookingSnap.data();
    if (bookingData.status === "cancelled") {
      alert("This booking has already been cancelled.");
      return;
    }

    const createdAt = new Date(bookingData.createdAt.seconds * 1000);
    const now = new Date();
    if ((now.getTime() - createdAt.getTime()) > 24 * 60 * 60 * 1000) {
      alert("Cancellation is only allowed within 24 hours.");
      return;
    }

    await updateDoc(bookingRef, { status: "cancelled", updatedAt: Timestamp.now() });
    alert("Booking cancelled successfully.");

    const clientUsername = await getClientUsername(bookingData.clientId);
    const artistDetails = await getArtistDetails(bookingData.artistId);

    await triggerNotification("cancelled", {
      artistId: bookingData.artistId,
      clientId: bookingData.clientId,
      artistName: artistDetails.fullName,
      clientUsername,
      bookingId,
      senderId: auth.currentUser?.uid || "",
      avatarUrl: artistDetails.avatar,
      timestamp: Timestamp.now(),
    });

    navigate("/user-dashboard");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center md:p-6"
      style={{ backgroundImage: `url(${authp})` }}>
      <div className="bg-white px-16 py-[120px] md:px-16 md:py-20 md:rounded-[30px] h-screen md:h-auto shadow-lg w-full max-w-3xl">
        {/* 🔙 Back Button */}
        <button className="text-[#8C8C8C] text-4xl mb-6 -mt-5" onClick={() => navigate(-1)}>
          <IoChevronBackCircleOutline />
        </button>

        {/* 📌 Request ID */}
        <h2 className="text-lg font-bold text-center mt-1">
          {booking?.requestId ? `Request ID #${booking.requestId}` : "Request ID Not Found"}
        </h2>

        {/* 📝 Booking Details */}
        <div className="mt-4 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input type="text" value={booking?.fullName || ""} className="w-full border border-gray-300 rounded-full px-4 py-2" readOnly />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input type="email" value={booking?.email || ""} className="w-full border border-gray-300 rounded-full px-4 py-2" readOnly />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number</label>
            <input type="text" value={booking?.phone || ""} className="w-full border border-gray-300 rounded-full px-4 py-2" readOnly />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">Message (optional)</label>
            <textarea className="w-full border border-gray-300 rounded-2xl px-4 py-2" rows={4} value={booking?.message || "No message provided."} readOnly />
          </div>
        </div>

       {/* 📎 View Attachment Button (Only shows when there's an attachment) */}
{booking?.attachment && (
  <button className="[font-family:'Khula',Helvetica] text-[#191919] text-opacity-50 text-xs hover:underline w-full mt-4" onClick={() => setShowAttachment(true)}>
    View Attachment
  </button>
)}

{/* 📅 Artist Calendar (Ensures Booked Dates Show Correctly) */}
<div className="mt-6 z-20 flex justify-center">
  {booking?.selectedDates && Array.isArray(booking.selectedDates) && booking.selectedDates.length > 0 ? (
    <>
      {/* ✅ Desktop View - Show Calendar Normally */}
      <div className="hidden md:block w-[800px] max-w-[800px] md:max-w-[900px]">
        <ArtistCalendar
          bookedDates={booking.selectedDates.map((date: string) => new Date(date).toISOString().split("T")[0])}
          unavailableDates={[]} 
          setUnavailableDates={() => {}} 
          setChangesMade={() => {}}
          isReadOnly={true}
        />
      </div>

      {/* ✅ Mobile View - Show Button Instead */}
      <div className="block md:hidden text-center">
        <button 
          className="bg-[#0099D0] text-white px-3 py-3 rounded-full text-sm font-semibold"
          onClick={() => setShowCalendarOverlay(true)}
        >
          <BsFillCalendar2WeekFill size={20} />
        </button>
      </div>
    </>
  ) : (
    <p className="text-gray-500 text-center">No selected dates available.</p>
  )}
</div>

{/* 📅 Calendar Overlay for Mobile */}
{showCalendarOverlay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-300 w-full max-w-[400px] relative">
      
      {/* ❌ Close Button */}
      <button 
        className="absolute top-2 right-3 text-black text-xs"
        onClick={() => setShowCalendarOverlay(false)}
      >
        ✖
      </button>

      {/* 📅 Render the Calendar */}
      <ArtistCalendar
        bookedDates={booking.selectedDates.map((date: string) => new Date(date).toISOString().split("T")[0])}
        unavailableDates={[]} 
        setUnavailableDates={() => {}} 
        setChangesMade={() => {}}
        isReadOnly={true}
      />
    </div>
  </div>
)}

{/* 🎨 Artist Actions vs Client Actions */}
{auth.currentUser?.uid === booking?.artistId ? (
  booking?.status === "pending" ? (
    <div className="flex justify-between space-x-4 mt-6">
      <button className="bg-[#7db23a] text-white px-6 py-2 rounded-full flex-1" onClick={() => handleUpdateStatus("active")}>
        Accept
      </button>
      <button className="border border-gray-500 text-gray-500 px-6 py-2 rounded-full flex-1" onClick={() => handleUpdateStatus("cancelled")}>
        Cancel
      </button>
      <button className="bg-[#00E1FF] text-white px-6 py-2 rounded-full flex-1" onClick={() => navigate(`/message/${booking?.clientId}`)}>
        Message
      </button>
    </div>
    
  ) : booking?.status === "cancelled" || booking?.status === "completed" ? ( 
    <div className="flex justify-center">
    <button className="border border-gray-400 text-gray-400 px-6 py-2 rounded-full w-full mt-6 cursor-not-allowed" disabled>
      {booking?.status === "cancelled" ? "Cancelled" : "Completed"}
    </button>
    </div>
  ) : (
    <div className="flex justify-between space-x-4 mt-6">
      <button className="bg-[#7db23a] text-white px-6 py-2 rounded-full flex-1" onClick={() => setShowStatusMenu(!showStatusMenu)}>
        Update Status
      </button>
      <button className="bg-[#00E1FF] text-white px-6 py-2 rounded-full flex-1" onClick={() => startChatWithClient(booking.clientId)}>
        Message
      </button>
    </div>
  )
) : (
  booking?.status === "cancelled" || booking?.status === "completed" ? ( 
    <div className="flex justify-center">
      <button className="border border-gray-400 text-gray-400 px-6 py-2 rounded-full w-[600px] mt-6 cursor-not-allowed" disabled>
        {booking?.status === "cancelled" ? "Cancelled" : "Completed"}
      </button>
    </div>
  ) : (
    <div className="flex justify-center">
      <button
        className={`border px-6 py-2 rounded-full w-[605px] flex justify-center mt-6 ${
          !canCancel ? "bg-gray-400 text-gray-300 cursor-not-allowed" : "bg-red-500 text-white"
        }`}
        onClick={handleCancelBooking}
        disabled={!canCancel}
      >
        Cancel Booking
      </button>
    </div>
  )
)}




{showStatusMenu && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    {/* Status Menu Overlay */}
    <div className="bg-white rounded-lg shadow-lg p-10 border border-gray-300 w-[300px] relative">
      
      {/* ❌ Close Button */}
      <button 
        className="absolute top-2 right-3 text-black text-xs"
        onClick={() => setShowStatusMenu(false)}
      >
        ✖
      </button>

      {/* Status Options */}
      <div className="flex flex-col items-center">
        {booking?.status === "on-hold" ? (
          <button 
            className="w-full py-2 text-sm bg-[#191919] bg-opacity-30 text-white rounded-full mb-2" 
            onClick={() => handleConfirmUpdateStatus("active")}
          >
            In Progress
          </button>
        ) : (
          <button 
            className="w-full py-2 text-sm bg-[#191919] bg-opacity-30 text-white rounded-full mb-2" 
            onClick={() => handleConfirmUpdateStatus("on-hold")}
          >
            Put on-hold
          </button>
        )}
        
        <button 
          className="w-full py-2 text-sm border border-gray-500 text-gray-500 rounded-full mb-2" 
          onClick={() => handleConfirmUpdateStatus("cancelled")}
        >
          Cancel
        </button>
        <button 
        className={`w-full py-2 text-sm ${
          booking?.paymentType === "Full Payment" && !booking?.paymentVerified
            ? "!bg-red-500 !text-white !opacity-100 cursor-not-allowed"  // 🔴 Force Red when disabled
            : "bg-[#191919] bg-opacity-30 text-white"
        } rounded-full mb-2`}
        onClick={() => handleConfirmUpdateStatus("completed")}
        disabled={booking?.paymentType === "Full Payment" && !booking?.paymentVerified}
      >
        Completed
      </button>
      </div>
    </div>
  </div>
)}

{/* 📎 Attachment Overlay (Now Has a Close Button) */}
{showAttachment && booking?.attachment && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-10">
    <div className="p-6 rounded-lg shadow-lg w-full max-w-xl relative">
      {/* ❌ Close Button */}
      <button className="absolute top-4 right-2 bg-black text-white p-2 rounded-full" onClick={() => setShowAttachment(false)}>
        ❌
      </button>

      {/* 📎 Display Image or File Link */}
      {booking.attachment.match(/\.(jpeg|jpg|gif|png)$/) ? (
        <img src={booking.attachment} alt="Attachment" className="w-full h-auto rounded-lg" />
      ) : (
        <a href={booking.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          View Attached File
        </a>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default ClientBookingDetails;

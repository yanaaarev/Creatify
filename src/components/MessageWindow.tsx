import { useEffect, useState, useRef } from "react";
import { auth, db } from "../config/firebaseConfig";
import { doc, updateDoc, addDoc, collection, getDoc, getDocs, Timestamp, query, where } from "firebase/firestore";
import { listenForMessages, sendMessage } from "../functions/chatFunctions";
import uploadtoCloudinary from "../functions/uploadtoCloudinary";
import ChatInput from "./ChatInput";
import { IoClose } from "react-icons/io5"; // ✅ Close Button Icon
import { triggerNotification} from "../utils/triggerNotification";
import { MdPayments } from "react-icons/md"; // ✅ Payment Icon
import { ClipLoader } from "react-spinners";
import { format } from "date-fns"; // ✅ Import date-fns for formatting timestamps

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

interface Message {
  id: string;
  senderId?: string;
  content?: string;
  avatarUrl?: string;
  attachmentUrl?: string
  type?: string; // ✅ Used to differentiate payment request messages
  paymentId?: string; // ✅ Reference to payment data in Firestore
  timestamp?: Timestamp;
}

const MessageWindow = ({ chatId }: { chatId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const userId = auth.currentUser?.uid || ""; // ✅ Fallback for undefined user
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // ✅ For Image Overlay
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [paymentType, setPaymentType] = useState("Down Payment");
  const [paymentNote, setPaymentNote] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofAttachment, setProofAttachment] = useState<File | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
const [showProofOverlay, setShowProofOverlay] = useState(false);
const [buttonLoading, setButtonLoading] = useState(false);
  const [proofDate, setProofDate] = useState("");
  // ✅ Fetch chat details to properly determine user roles
const [isArtist, setIsArtist] = useState<boolean>(false);
const lastMessageRef = useRef<HTMLDivElement | null>(null);
const [showGcashQR, setShowGcashQR] = useState(false);
const [showGotymeQR, setShowGotymeQR] = useState(false);


useEffect(() => {
  const fetchChatData = async () => {
    if (!chatId) return;
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      setIsArtist(chatData.artistId === userId); // ✅ Check if the user is the artist
    }
  };

  fetchChatData();
}, [chatId, userId]); // ✅ Depend on chatId and userId


  useEffect(() => {
    if (!chatId) return;
    return listenForMessages(chatId, setMessages);
  }, [chatId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // ✅ Triggers scroll on new messages

  // ✅ Helper function to fetch artist details
const getArtistDetails = async (artistId: string): Promise<{ fullName: string; avatar: string }> => {
  try {
    const userRef = doc(db, "artists", artistId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { fullName: userData.fullName || "Unknown Artist", avatar: userData.avatar || DEFAULT_AVATAR_URL };
    }
  } catch (error) {
    console.error("❌ Error fetching artist details:", error);
  }
  return { fullName: "Unknown Artist", avatar: DEFAULT_AVATAR_URL };
};

// ✅ Helper function to fetch client username
const getClientUsername = async (clientId: string): Promise<string> => {
  try {
    const userRef = doc(db, "users", clientId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().username || "Unknown User";
    }
  } catch (error) {
    console.error("❌ Error fetching client username:", error);
  }
  return "Unknown User";
};

const formatMessageText = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline break-words"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};


// ✅ Handle Payment Request Submission
const handleRequestPayment = async () => {
  if (!commissionAmount || !paymentDueDate) {
    alert("❌ Please enter all required fields.");
    return;
  }

setButtonLoading(true);

  const amount = parseFloat(commissionAmount);

  // ✅ Ensure correct fee application
  // ✅ Apply a fixed platform fee of ₱50
const platformFee = 50;
const totalAmount = amount + platformFee;

// ✅ Calculate platform fee as a percentage of the amount (for reference, not applied)
const platformFeeRate = (platformFee / amount) * 100;

  try {
    // ✅ Retrieve Client ID from Firestore Chat Document
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.error("❌ Chat document does NOT exist! Cannot proceed.");
      return;
    }

    const chatData = chatSnap.data();
    const clientId = chatData.clientId;

    if (!clientId) {
      console.error("❌ Client ID not found in chat document.");
      alert("Failed to request payment: Client ID is missing.");
      return;
    }

    // ✅ Fetch booking ID related to this payment
const bookingQuery = query(
  collection(db, "bookings"),
  where("artistId", "==", userId),
  where("clientId", "==", clientId),
  where("status", "in", ["pending", "active", "on-hold"]) // ✅ Only consider active bookings
);
const bookingSnap = await getDocs(bookingQuery);

if (bookingSnap.empty) {
  alert("No active booking found between this artist and client.");
  return;
}

const bookingId = bookingSnap.docs[0].id; // ✅ Fetch first matched booking ID

    // ✅ Fetch details for notification
    const artistDetails = await getArtistDetails(userId);
    const clientUsername = await getClientUsername(clientId);

    // ✅ Store Payment Data in Firestore
    const paymentRef = await addDoc(collection(db, "payments"), {
      chatId,
      artistId: userId,
      clientId, 
      bookingId: bookingId,
      commissionAmount: amount,
      platformFee: platformFee,  // ✅ Store the fixed ₱50 fee
      platformFeeRate: platformFeeRate.toFixed(2), // ✅ Store calculated % for reference
      totalAmount,
      paymentType,
      paymentDueDate,
      paymentNote,
      proofOfPayment: null, 
      referenceNumber: null, // ✅ Ensure field is created
      proofDate: null, // ✅ Ensure field is created
      paymentStatus: "pending", // ✅ Initially pending
      createdAt: Timestamp.now(),
    });

    // ✅ Store paymentId inside the corresponding booking
const bookingRef = doc(db, "bookings", bookingId);
await updateDoc(bookingRef, { paymentId: paymentRef.id });

console.log("✅ Payment ID stored in booking:", paymentRef.id);

    // ✅ Send message with Payment Request Button
    await sendMessage(chatId, "", {
      type: "payment-request",
      paymentId: paymentRef.id,
    });

    // ✅ Trigger notification for "payment-request"
    await triggerNotification("payment-request", {
      artistId: userId,
      clientId,
      artistName: artistDetails.fullName,
      clientUsername,
      bookingId: chatData.bookingId || "", 
      senderId: auth.currentUser?.uid || "",
      avatarUrl: artistDetails.avatar,
      timestamp: Timestamp.now(),
    });

    setButtonLoading(false);
    setShowPaymentForm(false);
    window.location.reload(); // ✅ Refresh the page to reflect changes
    alert("✅ Payment request sent successfully!");

  } catch (error) {
    console.error("❌ Error requesting payment:", error);
  }
};

// ✅ Handle Uploading Proof of Payment
const handleUploadProof = async () => {
  try {
    // 🔹 Ensure all required fields are filled
    if (!proofAttachment) {
      alert("❌ Please upload a proof of payment.");
      return;
    }

    if (!referenceNumber.trim()) {
      alert("❌ Please enter the reference number.");
      return;
    }

    if (!proofDate) {
      alert("❌ Please select a date of payment.");
      return;
    }

    console.log("🚀 Uploading Proof of Payment:", proofAttachment);

    // 🔹 Ensure proofAttachment is a valid File object before uploading
    if (!(proofAttachment instanceof File)) {
      alert("❌ Invalid file format. Please select an image file.");
      return;
    }

    setButtonLoading(true);

    // 🔹 Use the `selectedPayment` to get the correct `paymentId`
    const paymentId = selectedPayment?.paymentId || selectedPayment?.id;

    if (!paymentId) {
      console.error("❌ No Payment ID found in selectedPayment.");
      alert("❌ Payment request not found. Please try again.");
      setButtonLoading(false);
      return;
    }

    // 🔹 Validate the payment document exists in Firestore
    const paymentRef = doc(db, "payments", paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      console.error("❌ Payment request document does NOT exist:", paymentId);
      alert("❌ Payment request not found. Please try again.");
      setButtonLoading(false);
      return;
    }

    const paymentData = paymentSnap.data();
    const artistId = paymentData.artistId;
    const clientId = paymentData.clientId;

    // 🔹 Fetch details for notification
    const artistDetails = await getArtistDetails(artistId);
    const clientUsername = await getClientUsername(clientId);

    // 🔹 Upload the proof of payment to Cloudinary
    const proofUrl = await uploadtoCloudinary(proofAttachment, "proof_of_payment");

    if (!proofUrl) {
      console.error("❌ Cloudinary upload failed. No URL received.");
      alert("❌ Failed to upload proof of payment. Please try again.");
      setButtonLoading(false);
      return;
    }

    console.log("✅ Proof uploaded successfully:", proofUrl);

    // 🔹 Update the correct payment document in Firestore
    await updateDoc(paymentRef, {
      proofOfPayment: proofUrl,
      referenceNumber: referenceNumber.trim(),
      proofDate,
      paymentStatus: "pending", // ✅ Ensure the status updates
    });

    console.log("✅ Firestore updated with proof of payment");

    // 🔹 Update the UI with the updated payment data
    setSelectedPayment((prev: any) => ({
      ...prev,
      proofOfPayment: proofUrl,
      referenceNumber: referenceNumber.trim(),
      proofDate,
      paymentStatus: "pending",
    }));

    alert("✅ Proof of payment submitted successfully!");
    setButtonLoading(false);
    setShowProofForm(false);
    window.location.reload(); // ✅ Refresh the page to reflect changes

    // 🔹 Trigger notification for "payment"
    await triggerNotification("payment", {
      artistId,
      clientId,
      artistName: artistDetails.fullName,
      clientUsername,
      bookingId: paymentData.bookingId || "",
      senderId: auth.currentUser?.uid || "",
      avatarUrl: artistDetails.avatar,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("❌ Error uploading proof:", error);
    alert("❌ Failed to upload proof of payment. Please try again.");
    setButtonLoading(false);
  }
};

// ✅ Handle Viewing Payment Request
const handleViewPayment = async (paymentId: string) => {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      setSelectedPayment({ ...paymentSnap.data(), paymentId }); // ✅ Include paymentId in selectedPayment
      setShowPaymentDetails(true);
    } else {
      alert("❌ Payment request not found.");
    }
  } catch (error) {
    console.error("❌ Error fetching payment request:", error);
  }
};

  return (
    <div className="w-full xl:w-[920px] h-full bg-white justify-self-center flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 py-5">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={msg.id} className={`flex items-end ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
            ref={index === messages.length - 10 ? lastMessageRef : null} // ✅ Attach ref to last message
            >

              {/* ✅ Message Bubble */}
          <div
            className={`relative px-4 py-2 max-w-[85%] md:max-w-[65%] rounded-lg flex flex-col ${
              msg.senderId === userId
                ? "bg-[#7db23a] text-white rounded-br-none"
                : "bg-[#E6E6E6] text-black rounded-bl-none"
            }`}
          >
            {/* ✅ Normal Message Content */}
            {msg.type === "payment-request" && msg.paymentId ? (
              <button
                className="text-[#0099D0] text-sm font-medium underline cursor-pointer"
                onClick={() => handleViewPayment(msg.paymentId!)}
              >
                View Request for Payment
              </button>
            ) : (
              <p className="break-words whitespace-pre-wrap">
              {formatMessageText(msg.content ?? "")}
            </p>
            )}

            {/* ✅ Timestamp */}
            {msg.timestamp && (
                    <span className="text-gray-400 text-xs mt-1 self-end">
                      {format(new Date(msg.timestamp.toDate()), "hh:mm a")} {/* Format as "12:30 PM" */}
                    </span>
                  )}

            {/* ✅ Clickable Attachments (Now Wrapped Properly) */}
            {msg.attachmentUrl && (
              <div className="mt-2 flex flex-col gap-2 items-start"> {/* ✅ Ensures attachments stack properly */}
                <img
                  src={msg.attachmentUrl}
                  alt="Attachment"
                  className="w-full max-w-[240px] h-auto rounded-lg border border-gray-300 cursor-pointer object-cover"
                  onClick={() => setSelectedImage(msg.attachmentUrl ?? null)}
                />
              </div>
            )}

            {/* ✅ Message Tail */}
            <div
              className={`absolute w-0 h-0 border-t-8 border-transparent ${
                msg.senderId === userId
                  ? "right-0 bottom-0 border-r-8 border-[#7db23a]"
                  : "left-0 bottom-0 border-l-8 border-[#E6E6E6]"
              }`}
            ></div>
          </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
        )}
      </div>

        {/* ✅ Chat Input & Payment Button Wrapper */}
        <div className="flex justify-center items-center w-full pt-3 mx-auto">
            {/* ✅ Payment Button (Visible for Artists Only) */}
            {isArtist && (
            <button
              className="text-gray-600 hover:text-gray-700 px-3 md:px-4 transition mt-1"
              onClick={() => setShowPaymentForm(true)}
            >
              <MdPayments size={24} />
            </button>
          )}
          
          {/* ✅ Chat Input */}
          <ChatInput chatId={chatId} />
        </div>


      {/* ✅ Payment Request Form Overlay */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white md:p-[90px] py-16 sm:py-[60px] px-12 md:py-20 md:rounded-[30px] w-full md:max-w-lg md:h-[720px] h-full relative">
            <button className="absolute top-4 right-4 text-gray-600 p-3" onClick={() => setShowPaymentForm(false)}>
              <IoClose size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8 -mt-6">Request Payment Form</h2>

            <label className="block font-semibold mb-1 items-center">
            Commission Amount
            <span className="text-red-500 ml-1">*</span> {/* ✅ Required Indicator */}
          </label>
            <input
              type="number"
              className="w-full border border-black rounded-full p-3"
              placeholder="Enter amount"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
            />
          <span className="text-gray-500 text-xs">Enter the agreed amount for the commission</span>

            <label className="block font-semibold mt-3 mb-1">Payment Due Date</label>
            <input type="date" className="w-full border border-black rounded-full p-3" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} />

            <span className="text-gray-500 text-xs">Set the due date for the payment</span>

            <div className="relative">
            <label className="block font-semibold mt-3 mb-1">Payment Type</label>
            <div className="relative">
              <select
                className="w-full border border-black rounded-full p-3 pr-10 appearance-none bg-white cursor-pointer"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option>Down Payment</option>
                <option>Full Payment</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-3 text-xs pr-1 flex items-center pointer-events-none">
                ▼
              </div>
            </div>
          </div>
            <span className="text-gray-500 text-xs">Select the payment type</span>
            <label className="block font-semibold mt-3 mb-1">Note (Optional)</label>
            <div className="relative">
              <textarea
                className="w-full border border-black rounded-full p-4 resize-none"
                value={paymentNote}
                onChange={(e) => {
                  if (e.target.value.length <= 150) { // ✅ Limit to 150 characters
                    setPaymentNote(e.target.value);
                  }
                }}
                maxLength={150} // ✅ Hard limit on input
                placeholder="Enter a short note (max 150 characters)"
              />
            {/* ✅ Additional Notes Text (Left) & Character Counter (Right) */}
            <div className="flex justify-between mt-1 px-1">
                <span className="text-gray-500 text-xs">Add any additional notes</span>
                <span className="text-gray-400 text-xs">{paymentNote.length}/150</span>
              </div>
            </div>
            <button
  className="[font-family: 'Khula', Helvetica] font-semibold bg-[#0099D0] text-xl text-white px-4 py-3 rounded-full mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={handleRequestPayment}
  disabled={!commissionAmount || parseFloat(commissionAmount) <= 0 || buttonLoading}
>
{buttonLoading ? <ClipLoader size={20} color="white" /> : "Submit"}
</button>
          </div>
        </div>
      )}

      {/* ✅ Payment Request Details Overlay */}
        {showPaymentDetails && selectedPayment ? (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white py-20 px-10 md:p-16 md:rounded-[30px] shadow-lg w-full max-w-lg md:h-auto h-full relative">

              {/* ❌ Close Button */}
              <button className="absolute top-4 right-4 text-gray-600" onClick={() => setShowPaymentDetails(false)}>
                <IoClose size={24} />
              </button>

              {/* 📝 Payment Details */}
              <h2 className="text-lg font-bold mb-8 text-center">Request for Payment</h2>

              {selectedPayment ? (
                <>
                  {/* ✅ Ensure correct Firestore field names */}
                  <p className="text-gray-700 text-sm text-center">
                    Your commission amount is <strong>₱{(selectedPayment.commissionAmount ?? 0).toLocaleString()}</strong>. 
                    A fixed platform fee of <strong>₱{selectedPayment.platformFee ?? 0}</strong> is applied, bringing the total to 
                    <strong> ₱{(selectedPayment.totalAmount ?? 0).toLocaleString()}</strong>.
                  </p>

                  <p className="text-gray-700 text-sm mt-3 text-center mb-5">
                    The payment type is <strong>{selectedPayment.paymentType || "N/A"}</strong>, and you can make the payment via the following methods:
                  </p>

                  {/* ✅ GCash Payment Details */}
              <div className="text-center mb-6">
                <p className="text-black font-semibold">GCash</p>
                <p className="text-sm italic">Nathalie Shayne B. Sarmiento</p>
                <p className="text-gray-700">+63 921 748 5562</p>
                <button 
                  onClick={() => setShowGcashQR(true)} 
                  className="mt-1 text-blue-600 text-sm hover:underline"
                >
                  View QR Code
                </button>
              </div>

              {/* ✅ GOTYME Bank Transfer Details */}
              <div className="text-center">
                <p className="text-black font-semibold">GOTYME Bank Transfer</p>
                <p className="text-sm italic">Reannah Mara Tecson Revellame</p>
                <p className="text-gray-700">0176 4991 6186</p>
                <button 
                  onClick={() => setShowGotymeQR(true)} 
                  className="mt-1 text-blue-600 text-sm hover:underline"
                >
                  View QR Code
                </button>
                </div>

                  <p className="text-gray-700 mt-3 text-sm text-center leading-loose">
                    <strong>Note from the Artist:<br></br></strong> {selectedPayment.paymentNote || "N/A"}
                  </p>

                  <p className="text-gray-700 mt-3 text-center text-sm mb-3 leading-loose">
                    Your payment due date is on <strong>{selectedPayment.paymentDueDate || "N/A"}</strong>
                  </p>

                  <p className="text-gray-600 text-xs text-center">
                    Please note that the work will not begin until the down payment is received, and the final work will not be sent until the full payment is completed.
                  </p>

         {/* ✅ Artist & Client Buttons */}
         {selectedPayment.artistId === userId ? (
            <>
              {/* ✅ If proof exists, change the button */}
              {selectedPayment.proofOfPayment ? (
                <button
                  className="mt-4 bg-[#0099D0] text-white px-5 py-2 rounded-full w-full"
                  onClick={() => setShowProofForm(true)}
                >
                  View Payment Confirmation
                </button>
              ) : (
                <button
                  className="mt-4 bg-gray-400 text-gray-200 px-5 py-2 rounded-full w-full cursor-not-allowed"
                  disabled
                >
                  Awaiting Payment Proof...
                </button>
              )}
            </>
          ) : (
            <>
              {/* ✅ Client sees "Send Payment Confirmation" if no proof is uploaded */}
              {!selectedPayment.proofOfPayment ? (
                <button
                className="mt-4 bg-[#0099D0] text-white px-5 py-2 rounded-full w-full"
                onClick={() => {
                  setShowProofForm(true);
                  setShowPaymentDetails(false); // ✅ Close the Payment Request overlay
                }}
              >
                Send Payment Confirmation
              </button>
              ) : (
                <button
                  className="mt-4 bg-[#0099D0] text-white px-5 py-2 rounded-full w-full"
                  onClick={() => setShowProofForm(true)}
                >
                  View Payment Confirmation
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">Loading payment details...</p>
      )}
    </div>
  </div>
) : null}

{showGcashQR && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    
      <button 
        onClick={() => setShowGcashQR(false)} 
        className="absolute top-5 right-5 text-white text-2xl"
      >
        ✕
      </button>
      <div className="w-96 relative">
      <img src="/images/gcashqr.webp" alt="GCash QR Code" className="w-full h-full rounded-[30px]" />
    </div>
  </div>
)}

{showGotymeQR && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    
      <button 
        onClick={() => setShowGotymeQR(false)} 
        className="absolute top-5 right-5 text-white text-2xl"
      >
        ✕
      </button>
      <div className="w-96 relative">
      <img src="/images/gotymeqr.webp" alt="GOTYME QR Code" className="w-full h-full rounded-[30px]" />
    </div>
  </div>
)}


{/* ✅ Payment Proof Submission & View Overlay */}
{showProofForm && selectedPayment && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white py-20 px-10 md:p-20 md:rounded-[30px] w-full max-w-lg md:h-auto h-full relative">
      
      {/* ❌ Close Button */}
      <button className="absolute top-4 right-4 text-gray-600" onClick={() => setShowProofForm(false)}>
        <IoClose size={24} />
      </button>

      {/* 📝 Client Uploading Proof of Payment */}
      {!selectedPayment?.proofOfPayment && selectedPayment?.clientId === userId ? (
        <>
          <h2 className="text-xl font-bold mb-7 text-left">Proof of Payment Form</h2>

         {/* 🔹 File Upload */}
            <label className="block font-semibold mb-2 items-center">Upload your proof of payment:
            <span className="text-red-500 ml-1">*</span> {/* ✅ Required Indicator */}
          </label>

            {/* ✅ Drag & Drop Container */}
            <div
              className="bg-[#191919] bg-opacity-30 rounded-full p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("proofUpload")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith("image/")) {
                    setProofAttachment(file);
                  } else {
                    alert("Only image files are allowed.");
                  }
                }
              }}
            >
              {proofAttachment ? (
                <div>
                  <p className="text-green-600 font-semibold">✅ Proof of Payment Uploaded</p>
                  <button
                    className="text-[#0099D0] underline mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (proofAttachment) {
                        setShowProofOverlay(true);
                      } else {
                        alert("No attachment available to view.");
                      }
                    }}
                  >
                    View Attachment
                  </button>
                  <button
                    className="text-red-500 underline ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProofAttachment(null);
                    }}
                  >
                    Remove Attachment
                  </button>
                </div>
              ) : (
                <p className="[font-family:'Khula',Helvetica] text-xs font-semibold text-white">Drag & drop or browse file</p>
              )}
            </div>

            {/* ✅ Hidden File Input (Limited to 1 Image) */}
            <input
              type="file"
              id="proofUpload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.type.startsWith("image/")) {
                  setProofAttachment(file);
                } else {
                  alert("Only image files are allowed.");
                  setProofAttachment(null);
                }
              }}
            />

          {/* ✅ Proof of Payment Overlay (Fixed Issue) */}
          {showProofOverlay && proofAttachment && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="w-full max-w-md relative">

                {/* ❌ Close Button */}
                <button
                  className="absolute top-6 -right-3 bg-red-500 text-white text-sm p-2 px-3 rounded-full"
                  onClick={() => setShowProofOverlay(false)}
                >
                  ✕
                </button>

                <h2 className="text-lg font-bold text-center">Proof of Payment</h2>

                {/* 🖼️ View Proof Image */}
                <div className="mt-4 flex justify-center">
                  <img
                    src={URL.createObjectURL(proofAttachment)}
                    alt="Proof of Payment"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🔹 Reference Number */}
          <label className="block font-semibold mt-4">Reference Number
          <span className="text-red-500 ml-1">*</span> {/* ✅ Required Indicator */}
          </label>
          <input
            type="text"
            className="w-full border border-black rounded-full p-3"
            placeholder="Enter reference number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />

          {/* 🔹 Date of Payment */}
          <label className="block font-semibold mt-4">Date of Payment</label>
          <input
            type="date"
            className="w-full border border-black rounded-full p-3"
            value={proofDate}
            onChange={(e) => setProofDate(e.target.value)}
          />

          {/* 🔹 Submit Button */}
          <button
            className="bg-[#0099D0] text-white px-5 py-2 rounded-full w-full mt-6 text-lg font-semibold"
            onClick={handleUploadProof}
            disabled={!proofAttachment || !referenceNumber || !proofDate || buttonLoading}
          >
            {buttonLoading ? <ClipLoader size={20} color="white" /> : "Submit"}
          </button>
        </>
      ) : (
        <>
          {/* ✅ Viewing Proof of Payment */}
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-16 md:rounded-[30px] shadow-lg w-full max-w-lg h-full md:h-auto relative">
              
              {/* ❌ Close Button */}
              <button className="absolute top-4 right-4 text-gray-600" onClick={() => setShowProofForm(false)}>
                <IoClose size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4 text-center">Payment Confirmation</h2>

              {/* 🔹 View Proof Image */}
              <p className="text-gray-500 text-sm text-center mt-2">Proof of Payment:</p>
              <button
                className="text-sm text-[#0099D0] underline w-full"
                onClick={() => {
                  if (selectedPayment?.proofOfPayment) {
                    setSelectedProof(selectedPayment.proofOfPayment);
                    setShowProofOverlay(true);
                  } else {
                    alert("No proof of payment uploaded yet.");
                  }
                }}
              >
                View Attachment
              </button>

              {/* 🔹 Reference Number */}
              <p className="text-gray-500 mt-3 text-sm text-center">
                Reference Number:<br />
                <span className="text-black mt-2 text-sm">{selectedPayment?.referenceNumber || "N/A"}</span>
              </p>

              {/* 🔹 Date of Payment */}
              <p className="text-gray-500 mt-3 text-sm text-center">
                Date of Payment:<br />
                <span className="text-black">{selectedPayment?.proofDate || "N/A"}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
)}

{/* ✅ Proof of Payment Overlay (For Image Preview) */}
{showProofOverlay && selectedProof && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    
    {/* ❌ Close Button on Outer Right */}
    <button
      className="absolute top-5 right-5 text-white text-2xl"
      onClick={() => setShowProofOverlay(false)}
    >
      ✕
    </button>

    <div className="p-1 rounded-lg shadow-lg w-full max-w-md relative">
      {/* ✅ View Proof Image */}
      <div className="flex justify-center">
        <img
          src={selectedProof}
          alt="Proof of Payment"
          className="max-w-full h-[700px] rounded-lg"
        />
      </div>
    </div>
  </div>
)}

    {/* ✅ Image Overlay */}
    {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative p-4">
            <button
              className="absolute top-3 right-1 text-white text-2xl bg-red-700 rounded-full p-1"
              onClick={() => setSelectedImage(null)}
            >
              <IoClose />
            </button>
            <img
              src={selectedImage}
              alt="Full-size Attachment"
              className="max-w-[90vw] max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageWindow;

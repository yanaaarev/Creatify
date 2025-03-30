import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "../../config/firebaseConfig";
import { addDoc, collection, Timestamp, doc, getDoc } from "firebase/firestore";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { triggerNotification } from "../../utils/triggerNotification"; // Adjust path as needed
import authp from "/images/authp.webp";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig"; // Import analytics

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

const BookingRequest = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Extract selectedDates from URL
  const searchParams = new URLSearchParams(location.search);
  const selectedDates = searchParams.get("dates")?.split(",") || [];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [, setIsUploading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (!selectedDates.length) {
      alert("No selected dates found. Please go back and select dates.");
      navigate(`/book-artist/${artistId}/booking-calendar`);
    }
  }, [selectedDates, navigate, artistId]);

  // ✅ Handle File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // ✅ Validate File Type (Only Images Allowed)
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Invalid file type. Please upload an image.");
      return;
    }

    setIsUploading(true);
    alert("📤 Uploading file, please wait...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "booking_attachments");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddjnlhfnu/upload",
        formData
      );
      setUploadedFile(response.data.secure_url);
      alert("✅ File uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("❌ File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Handle File Selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileUpload(event.target.files[0]);
    }
  };

  // ✅ Handle Drag & Drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileUpload(event.dataTransfer.files[0]);
    }
  };

  // ✅ Remove Uploaded File
  const handleRemoveAttachment = () => {
    setUploadedFile(null);
    alert("❌ Attachment removed.");
  };
  

  const getArtistDetails = async (id: string): Promise<{ fullName: string; avatar: string }> => {  // ✅ Change parameter name to 'id'
    const userRef = doc(db, "artists", id);  // ✅ Use 'id' instead of 'artistId'
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { fullName: userData.fullName || "Unknown Artist", avatar: userData.avatar || DEFAULT_AVATAR_URL };
    }
    return { fullName: "Unknown Artist", avatar: DEFAULT_AVATAR_URL };
  };
  
  const handleConfirmBooking = async () => {
    if (!fullName || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }
  
    if (!agreeToTerms) {
      alert("You must agree to the Terms of Service and Copyright Policy.");
      return;
    }

  setButtonLoading(true);
  
    try {
      const nextRequestId = Math.floor(1000 + Math.random() * 9000);
  
      const bookingRef = await addDoc(collection(db, "bookings"), {
        artistId,  // ✅ Use artistId from useParams
        clientId: auth.currentUser?.uid,
        fullName,
        email,
        phone,
        message,
        selectedDates,
        attachment: uploadedFile || "",
        status: "pending",
        requestId: nextRequestId,
        createdAt: Timestamp.now(),
      });
  
      const artistDetails = await getArtistDetails(artistId as string);  // ✅ Typecast to string
  
      await triggerNotification("booking-request", {
        artistId: artistId as string,  // ✅ Use artistId from the component scope
        clientId: auth.currentUser?.uid || "",
        artistName: artistDetails.fullName,
        bookingId: bookingRef.id,
        senderId: auth.currentUser?.uid || "",
        avatarUrl: artistDetails.avatar,
        timestamp: Timestamp.now(),
      });

      // ✅ Log Event for Form Submission
    logEvent(analytics, "booking_submitted", {
      artist_id: artistId,
      client_id: auth.currentUser?.uid || "anonymous",
      request_id: nextRequestId,
      selected_dates: selectedDates.join(","),
    });

      // ✅ Clear stored dates after successful booking
      sessionStorage.removeItem("selectedDates");
  
      setButtonLoading(false);
      navigate(`/book-artist/${artistId}/booking-confirmation`);
    } catch (error) {
      setButtonLoading(false);
      console.error("❌ Error submitting booking request:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${authp})` }}>
      
      <div className="bg-white px-[30px] py-20 md:px-20 md:py-16 md:rounded-[30px] shadow-lg w-full max-w-3xl">
        {/* 🔙 Back Button */}
        <button className="text-[#8C8C8C] text-4xl" onClick={() => navigate(-1)}>
          <IoChevronBackCircleOutline />
        </button>

        {/* 📌 Booking Form Title */}
        <h2 className="text-lg font-semibold text-left mb-10 pt-5">Complete Your Booking Request</h2>

        {/* 🔹 Input Fields */}
        <div className="-mt-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="[font-family:'Khula',Helvetica] block text-sm font-semibold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full border border-gray-300 rounded-full px-4 py-2"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          {/* Email */}
          <div>
            <label className="[font-family:'Khula',Helvetica] block text-sm font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" className="w-full border border-gray-300 rounded-full px-4 py-2"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Phone Number */}
          <div>
            <label className="[font-family:'Khula',Helvetica] block text-sm font-semibold mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full border border-gray-300 rounded-full px-4 py-2"
              value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          {/* Message or Peg */}
          <div>
            <label className="[font-family:'Khula',Helvetica] block text-sm font-semibold mb-2">Message (optional)</label>
            <textarea className="w-full border border-gray-300 rounded-[30px] px-5 py-3"
              rows={4} maxLength={500} value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your project or add a reference peg..." />
          </div>

          <div className="mt-4">
      <label className="[font-family:'Khula',Helvetica] block text-sm font-semibold mb-2">Upload Peg (optional)</label>
      
      {/* 🔥 Drag & Drop Container (Now Clickable) */}
      <div
        className="border bg-[#191919] bg-opacity-30 rounded-[30px] p-3 text-center cursor-pointer"
        onClick={() => document.getElementById("fileInput")?.click()} // ✅ Opens File Picker on Click
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <p className="[font-family:'Khula',Helvetica] text-xs font-semibold text-white">Drag & drop a file or browse</p>
      </div>
    </div>
        </div>

         {/* ✅ View Attachment & Remove Attachment Buttons (Centered with Gap) */}
{uploadedFile && (
  <div className="-mt-3 flex justify-center items-center space-x-4 mb-5">
    <button
      className="[font-family:'Khula',Helvetica] text-xs text-[#7db23a] hover:underline"
      onClick={() => setShowAttachment(true)}
    >
      View Attachment
    </button>
    <button
      className="[font-family:'Khula',Helvetica] text-xs text-[#c72b2b] hover:underline"
      onClick={handleRemoveAttachment}
    >
      Remove Attachment
    </button>
  </div>
)}

      {/* 📎 Attachment Overlay */}
      {showAttachment && uploadedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="p-6 rounded-lg shadow-lg w-full max-w-xl relative">
            {/* ❌ Close Button */}
            <button
              className="absolute top-4 right-4 bg-black text-white p-2 rounded-full"
              onClick={() => setShowAttachment(false)}
            >
              ❌
            </button>

            {/* 📎 Display Image */}
            <img src={uploadedFile} alt="Attachment" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
        {/* ✅ Confirm Booking Button */}
        <div className="flex justify-center mt-3">
        <button className={`bg-[#7db23a] text-white px-5 py-2 rounded-full w-[350px] md:w-[660px] mb-3 ${!agreeToTerms ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleConfirmBooking} 
          disabled={!agreeToTerms || buttonLoading}
          >
          {buttonLoading ? <ClipLoader size={20} color="white" /> : "Confirm Booking"}
        </button>
        </div>

        {/* 🔹 Terms & Conditions (Responsive & Clickable Links) */}
<div className="mt-1 text-center">
  <label className="flex flex-wrap items-center justify-center text-center gap-1 text-xs text-[#191919] text-opacity-50">
    <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} />
    By proceeding, you agree to our
    <a href="/terms-and-conditions" className="font-semibold hover:underline">Terms of Service</a> and acknowledge that you have read our
    <a href="/copyright-policy" className="font-semibold hover:underline">Copyright Policy</a>.
  </label>
</div>
      </div>
    </div>
  );
};

export default BookingRequest;

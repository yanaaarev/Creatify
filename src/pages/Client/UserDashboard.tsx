import { useEffect, useState } from "react";
import { MdEdit, MdOutlineVpnKey, MdLogout, MdDelete } from "react-icons/md";
import { IoChevronForwardCircleOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { collection, doc, getDoc, getDocs, updateDoc, where, query, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoBanOutline } from "react-icons/io5";
import { IoChevronBackCircleOutline } from "react-icons/io5"; // ✅ Import Back Icon
import { updateProfile, sendPasswordResetEmail, deleteUser, signOut, onAuthStateChanged, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ClipLoader } from "react-spinners";

// ✅ Use Cloudinary URLs for default avatars
const defaultAvatars = [
  "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1739384476/avatar1_v5dblg.png",
  "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1739384477/avatar2_vovnf9.png",
  "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1739384476/avatar3_y69bjb.png",
  "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1739384476/avatar4_jyxoip.png"
];

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

export const UserDashboard = (): JSX.Element => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showAvatarOverlay, setShowAvatarOverlay] = useState(false); // ✅ Overlay state
  const [showOverlay, setShowOverlay] = useState<"username" | "email" | "password" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/client-login");
        return;
      }
      const userRef = doc(db, "users", currentUser.uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setUser({ uid: currentUser.uid, ...userSnapshot.data() });
      } else {
        console.error("User data not found in Firestore.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
  
    const fetchBookings = async () => {
      try {
        const bookingsQuery = query(collection(db, "bookings"), where("clientId", "==", user.uid));
        const querySnapshot = await getDocs(bookingsQuery);
  
        const fetchedBookings = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const bookingData = docSnapshot.data();
  
            // Fetch artist name from the "artists" collection
            const artistRef = doc(db, "artists", bookingData.artistId);
            const artistSnap = await getDoc(artistRef);
            const artistName = artistSnap.exists() ? artistSnap.data().fullName : "Unknown Artist";
  
            return {
              bookingId: docSnapshot.id,
              artistName: artistName,
              bookingDate: bookingData.createdAt, // Firestore timestamp
              status: bookingData.status || "Pending",
            };
          })
        );
  
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser(userData);
        setSelectedAvatar(userData.avatar || null);
      }
    };
    fetchUser();
  }, []);

  // ✅ Handle Avatar Selection
  const handleAvatarSelection = async (avatar: string) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { avatar });

      setSelectedAvatar(avatar); // ✅ Update UI immediately
      setShowAvatarOverlay(false); // ✅ Close overlay after selection
      window.location.reload();
    } catch (error) {
      console.error("❌ Error updating avatar:", error);
    }
  };
  
  const handleEdit = (field: "username" | "email" | "password") => {
    setShowOverlay(field);
    setInputValue(field === "password" ? "" : user[field]);
  };

  const handleUpdate = async () => {
    if (!inputValue) return;
    setButtonLoading(true);
    try {
      const userDoc = doc(db, "users", user.uid);
      if (showOverlay === "username") {
        await updateProfile(auth.currentUser!, { displayName: inputValue });
        await updateDoc(userDoc, { username: inputValue });
        setUser((prev: any) => ({ ...prev, username: inputValue }));
      } else if (showOverlay === "email") {
        await updateEmail(auth.currentUser!, inputValue);
        await updateDoc(userDoc, { email: inputValue });
        alert("A confirmation email has been sent to your previous email.");
        setUser((prev: any) => ({ ...prev, email: inputValue }));
      }
      setShowOverlay(null);
      setButtonLoading(false);
      window.location.reload();
    } catch (error) {
      setButtonLoading(false);
      console.error("Update failed:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) return alert("Both fields are required.");
    setButtonLoading(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser!.email!, oldPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      alert("Password updated successfully.");
      setShowOverlay(null);
      setButtonLoading(false);
      window.location.reload();
    } catch (error) {
      setButtonLoading(false);
      console.error("Password change failed:", error);
      alert("Incorrect old password or another issue occurred.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset link sent to your email.");
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-500";
      case "active":
        return "text-[#7db23a]";
      case "cancelled":
        return "text-red-500";
      case "on-hold":
        return "text-[#8A8A8A]";
      case "completed":
        return "text-[#00E1FF]";
      default:
        return "text-gray-500";
    }
  };
  

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
    try {
      const userDoc = doc(db, "users", user.uid);
      await deleteDoc(userDoc);
      await deleteUser(auth.currentUser!);
      navigate("/");
    } catch (error) {
      console.error("Account deletion failed:", error);
    }
  };

  // ✅ Handle Remove Avatar
const handleRemoveAvatar = async () => {
  if (!auth.currentUser) return;
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { avatar: "" }); // Set avatar to empty

    setSelectedAvatar(DEFAULT_AVATAR_URL); // ✅ Clear UI immediately
    setShowAvatarOverlay(false); // ✅ Close overlay
    window.location.reload(); // ✅ Ensure navbar updates immediately
  } catch (error) {
    console.error("❌ Error removing avatar:", error);
  }
};

const handleNavigate = (path: string) => {
  navigate(path);
  setTimeout(() => {
    window.location.reload(); // ✅ Ensures page reload
  }, 0); // Small delay to prevent unnecessary fast triggers
};

  if (loading) {
    return <p className="text-white text-lg text-center mt-10">Loading...</p>;
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row px-8 md:px-10 lg:px-20 py-10 gap-10">
    <div 
  className="absolute inset-0 w-full h-full bg-no-repeat bg-center"
  style={{ 
    backgroundImage: "url('/images/authp.png')",
    backgroundSize: "cover", // ✅ Ensures the full image is visible without zooming
    backgroundAttachment: "fixed", // ✅ Keeps the background consistent while scrolling
    backdropFilter: "none",  
    WebkitBackdropFilter: "none",
    filter: "none"
  }}
></div>


    {/* Sticky Sidebar (Hidden on Mobile, Sticks on Desktop) */}
    <div className="hidden md:flex sticky top-10 h-screen">
      <UserDashboardSidebar />
    </div>
    <div className="flex flex-col w-full items-center gap-10 relative mt-5 overflow-y-auto">

      {/* 🔙 Mobile Back Button (Only Visible on Mobile) */}
<div className="md:hidden fixed top-6 left-4 z-50">
  <button 
    onClick={() => window.history.back()} 
    className="text-gray-300 text-3xl px-4"
  >
    <IoChevronBackCircleOutline />
  </button>
</div>

   {/* Project Dashboard */}
<div id="project-dashboard" className="relative w-full max-w-[1000px] pt-5">
  <h2 className="font-semibold text-white text-lg md:text-[20px] mb-4">Project Dashboard</h2>
  
  <div className="flex flex-col gap-4">
  {bookings.length > 0 ? (
          <>
            {bookings
              .sort((a, b) => b.bookingDate.seconds - a.bookingDate.seconds) // Sort bookings by date, latest first
              .slice(0, showAllBookings ? bookings.length : 2)
              .map((booking) => (
                <div key={booking.bookingId} className="bg-[#7db23a40] p-6 px-9 flex flex-col gap-4 rounded-[30px] shadow-lg w-full">
                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 w-full">
                    {/* ✅ Display Artist Name */}
                    <p className="text-white text-[16px] font-normal">Artist: {booking.artistName}</p>

                    {/* ✅ Display Created Date in MM-DD-YY Format */}
                    <p className="[font-family:'Khula',Helvetica] text-white text-[16px]">
                      {booking.bookingDate && booking.bookingDate.seconds
                        ? new Date(booking.bookingDate.seconds * 1000)
                            .toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" })
                        : "Invalid Date"}
                    </p>

                    <div className="flex items-center gap-0 md:gap-1">
                  <span className={`text-lg md:text-2xl -mt-1 ${getStatusColor(booking.status || 'pending')}`}>●</span>
                 <p className={`text-[16px] font-semibold ${getStatusColor(booking.status || 'pending')}`}>
                 {(booking.status || 'pending').toUpperCase()}
                  </p>
                </div>


                    {/* ✅ View Details Button */}
                    <button
                      className="text-[#7db23a] text-[16px] hover:underline"
                      onClick={() => navigate(`/client-booking/${booking.bookingId}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}

            {/* ✅ See More / Close Button */}
            {bookings.length > 2 && (
              <button
                className="text-white text-[16px] font-semibold hover:underline mt-4"
                onClick={() => setShowAllBookings(!showAllBookings)}
              >
                {showAllBookings ? "Close" : `See More (${bookings.length - 2} more)`}
              </button>
            )}
          </>
        ) : (
          <p className="text-white text-[16px] text-center">No bookings available.</p>
        )}
      </div>


       {/* Account Info */}
  <div id="account-info" className="relative w-full max-w-[1000px] mt-10">
  <h2 className="font-semibold text-white text-lg md:text-[20px] mb-4">Account Info</h2>

  {[
    { label: "Username", value: user?.username, action: () => handleEdit("username") },
    { label: "Profile Icon", value: (
      <img
        src={selectedAvatar || DEFAULT_AVATAR_URL}
        alt="Profile Avatar"
        className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
      /> ), action: () => {} },
    { label: "Email", value: user?.email, action: () => handleEdit("email") },
    { label: "Change Password", action: () => handleEdit("password") },
    { label: "Forgot Password", icon: <MdOutlineVpnKey />, action: handleForgotPassword },
    { label: "Log Out", icon: <MdLogout />, action: handleLogout },
    { label: "Delete Account", icon: <MdDelete className="text-red-500" />, action: handleDeleteAccount }
  ].map(({ label, value, icon, action }, index) => (
    <div
      key={index}
      className="mt-4 bg-[#7db23a40] rounded-[30px] shadow-lg w-full max-w-[1000px] flex flex-wrap items-center justify-between px-6 md:px-8 py-4"
    >
      <p className="font-normal text-white text-[16px]">{label}</p>
      <div className="flex items-center gap-3">
        {value && <span className="text-white text-[16px]">{value}</span>}
        {label === "Profile Icon" ? (
              <MdEdit 
                className="text-white text-xl cursor-pointer" 
                onClick={() => setShowAvatarOverlay(true)} // ✅ Opens the Avatar Overlay
              />
            ) : icon ? (
              <span className="text-white text-xl cursor-pointer" onClick={action}>{icon}</span>
            ) : (
              <MdEdit className="text-white text-xl cursor-pointer" onClick={action} />
            )}
          </div>
        </div>
      ))}

{/* ✅ Avatar Selection Overlay */}
{showAvatarOverlay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-12 md:p-6 rounded-[30px] shadow-lg w-full md:w-[700px] md:h-[320px] relative flex flex-col items-center justify-center">
      
      {/* ❌ Close Button */}
      <button
        className="absolute top-2 right-3 text-red-500 text-2xl"
        onClick={() => setShowAvatarOverlay(false)}
      >
        <IoCloseCircleOutline />
      </button>

      {/* Title */}
      <h2 className="text-lg font-semibold text-center mb-4 md:mb-6">Select Your Avatar</h2>

      {/* Avatar Selection & Remove Button (Inline) */}
      <div className="flex justify-center gap-5 items-center">

        {/* Remove Avatar Button Styled as Avatar */}
        <button
          className="w-[50px] h-[50px] md:w-[100px] md:h-[100px] flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-red-500 bg-gray-100 hover:bg-red-100 text-gray-400 cursor-pointer"
          onClick={handleRemoveAvatar}
        >
          <IoBanOutline size={120} />
        </button>
        {defaultAvatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt={`Avatar ${index + 1}`}
            className="w-[50px] h-[50px] md:w-[100px] md:h-[100px] rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500"
            onClick={() => handleAvatarSelection(avatar)}
          />
        ))}
      </div>
    </div>
  </div>
)}

  {/* Edit Overlay */}
  {showOverlay && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-12 rounded-[30px] w-[90%] max-w-[400px] flex flex-col items-center">
        <h2 className="text-xl font-bold mb-5">
          {showOverlay === "password" ? "Change Password" : `Edit ${showOverlay}`}
        </h2>
        {showOverlay === "password" ? (
  <>
    <div className="relative w-full mb-4">
      <input
        type={showOldPassword ? "text" : "password"}
        placeholder="Old Password"
        className="w-full p-3 border rounded-[30px] pr-10"
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
        onClick={() => setShowOldPassword(!showOldPassword)}
      >
        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>

    <div className="relative w-full mb-4">
      <input
        type={showNewPassword ? "text" : "password"}
        placeholder="New Password"
        className="w-full p-3 border rounded-[30px] pr-10"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
        onClick={() => setShowNewPassword(!showNewPassword)}
      >
        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>

    <div className="flex gap-4 w-full">
      <button className="bg-[#7db23a] text-white px-4 py-2 rounded-[30px] flex-1" onClick={handlePasswordChange}
      disabled={buttonLoading}
      >
        {buttonLoading ? <ClipLoader size={20} color="white" /> : "Save"}
      </button>
      <button className="bg-gray-400 text-white px-4 py-2 rounded-[30px] flex-1" onClick={() => setShowOverlay(null)}>
        Cancel
      </button>
    </div>
  </>
) : (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border rounded-[30px] mb-4"
            />
            <div className="flex gap-4 w-full">
              <button className="bg-[#7db23a] text-white px-4 py-2 rounded-[30px] flex-1" onClick={handleUpdate}
              disabled={buttonLoading}
              >
                {buttonLoading ? <ClipLoader size={20} color="white" /> : "Save"}
              </button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded-[30px] flex-1" onClick={() => setShowOverlay(null)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )}
</div>

     {/* Help & Support */}
<div id="help-support" className="relative w-full max-w-[1133px] mt-10">
  <h2 className="font-semibold text-white text-lg md:text-[20px] text-left">Help & Support</h2>

  {[
    { label: "Frequently Asked Questions", path: "/faqs" },
    { label: "How to Book An Artist", path: "/how-to-book-an-artist" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
    { label: "Copyright Policy", path: "/copyright-policy" },
    { label: "Privacy Policy", path: "/privacy-policy" }
  ].map(({ label, path }, index) => (
    <div
      key={index}
      className="mt-4 bg-[#7db23a40] shadow-lg w-full max-w-[1000px] rounded-[30px] flex flex-wrap items-center justify-between px-6 md:px-8 py-4 cursor-pointer"
      onClick={() => handleNavigate(path)}
    >
      <p className="font-normal text-white text-[16px]">{label}</p>
      <IoChevronForwardCircleOutline className="text-white text-2xl" />
    </div>
  ))}

  {/* Contact Support Note */}
  <div className="mt-4 bg-[#7db23a40] shadow-lg w-full max-w-[1000px] rounded-[30px] flex flex-wrap items-center px-6 md:px-8 py-4">
    <p className="font-normal text-white text-[16px]">
      For assistance, contact us at{" "}
      <a href="mailto:ask.creatify@gmail.com" className="underline text-blue-400">
        ask.creatify@gmail.com
      </a>
      .
    </p>
  </div>

    </div>
    </div>
    </div>
    </div>
    
  );
};

export default UserDashboard;

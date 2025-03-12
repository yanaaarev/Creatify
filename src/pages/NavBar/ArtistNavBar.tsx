import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider
} from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";

import { BsFillCalendarCheckFill, BsPersonFill, BsQuestionCircle } from "react-icons/bs";
import { MdDashboard } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";
import { BiSolidCalendarEdit } from "react-icons/bi";
import { AiFillMessage } from "react-icons/ai";
import { FaEye, FaEyeSlash, FaChevronRight } from "react-icons/fa";
import NotificationComponent from "../../Notifications";
const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";
import LOGO from "/images/logo.png";

export const ArtistNavBar = (): JSX.Element => {
  const [user, setUser] = useState<any>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const artistRef = doc(db, "artists", currentUser.uid);

        // ✅ Real-time listener to update profile picture dynamically
        const unsubscribeSnapshot = onSnapshot(artistRef, (snapshot) => {
          if (snapshot.exists()) {
            setArtistData(snapshot.data());
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setArtistData(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/.test(password);
};

  const handleChangePassword = async () => {
    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 8 characters, include a number and an uppercase letter. Don't include special characters.");
      return;
    }
  
    if (!user || !user.email) {
      setPasswordError("No user authenticated.");
      return;
    }
  
    setLoading(true);
    setPasswordError("");
  
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential); // ✅ Reauthenticate user
  
      await updatePassword(user, newPassword); // ✅ Update password in Firebase Authentication
  
      // ✅ Also update Firestore with hashed password (for reference)
      const artistRef = doc(db, "artists", user.uid);
      await updateDoc(artistRef, {
        password: newPassword,
        passwordUpdatedAt: new Date().toISOString() // Save timestamp of password update
      });
  
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      alert("Password changed successfully!");
    } catch (error) {
      console.error("❌ Error changing password:", error);
      setPasswordError("Incorrect old password or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };
  

  return (
    <div className="w-screen">
      <header className="fixed inset-0 h-[94px] z-50 bg-[#19191980] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
        
        {/* Responsive Grid Container */}
        <div className="grid grid-cols-3 items-center h-full px-4 md:px-8 lg:px-16">
          
          {/* Left Section: Hamburger Menu for Mobile & Buttons for Desktop */}
        <div className="relative">
          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden mt-[1px] pl-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-white hover:text-gray-300 focus:outline-none text-[26px]"
            >
              ☰
            </button>
    
    {isMenuOpen && (
      <div className="absolute left-2 md:left-8 top-12 bg-[#FFFFFF] w-48 rounded-md shadow-lg z-50">
        <ul className="py-2">
          <li onClick={() => handleNavigate("/request-dashboard")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-black cursor-pointer">
            <BsFillCalendarCheckFill className="text-xl" /> Request Dashboard
          </li>
          <li onClick={() => handleNavigate("/artist-edit")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-black cursor-pointer">
            <BiSolidCalendarEdit className="text-xl" /> Edit Profile
          </li>
          <li onClick={() => handleNavigate("/artist-messages")} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-black cursor-pointer">
            <AiFillMessage className="text-xl" /> Messages
          </li>
        </ul>
      </div>
    )}
  </div>

  {/* Buttons for Desktop */}
  <div className="hidden md:flex items-center gap-3 md:gap-[50px]">
    <button className="text-white hover:text-gray-300 focus:outline-none">
      <BsFillCalendarCheckFill className="text-xl md:text-2xl" onClick={() => handleNavigate("/request-dashboard")} />
    </button>
    <button className="text-white hover:text-gray-300 focus:outline-none">
      <BiSolidCalendarEdit className="text-2xl md:text-3xl" onClick={() => handleNavigate("/artist-edit")} />
    </button>
    <button className="text-white hover:text-gray-300 focus:outline-none">
      <AiFillMessage className="text-2xl md:text-3xl" onClick={() => handleNavigate("/artist-messages")} />
    </button>
  </div>
</div>

          {/* Center Section: Logo (Fixed Alignment & Scaling) */}
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
  <img 
    className="h-[60px] md:h-[70px] lg:h-[70px] max-h-[70px] w-auto max-w-[150px] md:max-w-[160px] lg:max-w-[180px]" 
    alt="Logo" 
    src={LOGO} 
  />
</div>

         {/* Right Section: Notifications & User Dropdown */}
<div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 flex items-center gap-4 md:gap-10 pr-4 md:pr-8" ref={dropdownRef}>
  {/* 🔔 Notification Component */}
  <NotificationComponent />

  {/* 🧑🏻 User Dropdown */}
  <button className="text-white hover:text-gray-300 focus:outline-none" onClick={handleLoginClick}>
    <BsPersonFill className="text-4xl md:text-4xl" />
  </button>

                {user && isDropdownOpen && (
                <div className="absolute right-2 md:right-8 top-full mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">

                {/* Profile Section */}
                <div className="p-4 border-b border-gray-300 flex items-center space-x-3">
                <img 
                  src={artistData?.profilePicture || DEFAULT_AVATAR_URL} 
                  alt="Profile Image" 
                  className="w-[50px] h-[50px] max-w-[50px] max-h-[50px] aspect-square object-cover rounded-full border border-gray-300"
                />
                  <div className="flex flex-col">
                    <p className="text-[#191919] font-semibold text-sm">{artistData?.fullName || "Artist"}</p>
                    <p className="text-[#19191980] text-xs truncate max-w-[140px]">{artistData?.email || user?.email}</p>
                  </div>
                </div>

                {/* Dropdown Items */}
<ul className="py-2">
  {/* Artist Dashboard */}
  <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleNavigate("/artist-dashboard")}>
    <div className="flex items-center">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
        <MdDashboard className="text-[#191919] text-lg" />
      </div>
      <span className="text-[#191919] ml-3">Artist Dashboard</span>
    </div>
    <FaChevronRight className="text-gray-400" />
  </li>

  {/* Change Password */}
  <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => {setIsChangePasswordOpen(true);}}>
    <div className="flex items-center">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
        <RiLockPasswordFill className="text-[#191919] text-lg" />
      </div>
      <span className="text-[#191919] ml-3">Change Password</span>
    </div>
    <FaChevronRight className="text-gray-400" />
  </li>

  {/* Help & Support */}
  <li className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setShowHelpOverlay(true)}>
    <div className="flex items-center">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
        <BsQuestionCircle className="text-[#191919] text-lg" />
      </div>
      <span className="text-[#191919] ml-3">Help & Support</span>
    </div>
    <FaChevronRight className="text-gray-400" />
  </li>

  {/* Gray Line Separator */}
  <hr className="border-gray-300 my-2" />

  {/* Logout */}
  <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
      <IoLogOut className="text-[#191919] text-lg" />
    </div>
    <span className="text-[#191919] ml-3">Logout</span>
  </li>
</ul>
</div>
)}
</div>
</div>
</header>

{/* 🔹 SEPARATED Help & Support Overlay (Now outside dropdown) */}
{showHelpOverlay && (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[100]">
    <div className="bg-white px-6 py-8 rounded-[30px] w-full max-w-md shadow-lg relative flex flex-col animate-fadeIn">
      
      {/* ❌ Close Button */}
      <button 
        className="absolute top-5 right-5 text-gray-700 text-xl"
        onClick={() => setShowHelpOverlay(false)}
      >
        ✕
      </button>

      {/* Overlay Title */}
      <h2 className="text-lg font-semibold text-center mb-6">Help & Support</h2>

      {/* Help Links */}
      <div className="flex flex-col gap-4">
        <button 
          className="w-full bg-[#7db23a] text-white py-3 rounded-[30px] font-medium text-center transition hover:bg-[#6ba52b]"
          onClick={() => {
            setShowHelpOverlay(false);
            handleNavigate("/privacy-policy");
          }}
        >
          Privacy Policy
        </button>
        <button 
          className="w-full bg-[#7db23a] text-white py-3 rounded-[30px] font-medium text-center transition hover:bg-[#6ba52b]"
          onClick={() => {
            setShowHelpOverlay(false);
            handleNavigate("/copyright-policy");
          }}
        >
          Copyright Policy
        </button>
        <button 
          className="w-full bg-[#7db23a] text-white py-3 rounded-[30px] font-medium text-center transition hover:bg-[#6ba52b]"
          onClick={() => {
            setShowHelpOverlay(false);
            handleNavigate("/faqs");
          }}
        >
          FAQs
        </button>
        <button 
          className="w-full bg-[#7db23a] text-white py-3 rounded-[30px] font-medium text-center transition hover:bg-[#6ba52b]"
          onClick={() => {
            setShowHelpOverlay(false);
            handleNavigate("/terms-and-conditions");
          }}
        >
          Terms & Conditions
        </button>
      </div>
    </div>
  </div>
)}
  
      {isChangePasswordOpen && (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-12 rounded-[30px] w-full max-w-md relative">
      {/* ❌ Close Button */}
      <button
        className="absolute top-5 right-5 text-gray-700 text-xl"
        onClick={() => setIsChangePasswordOpen(false)}
      >
        ✕
      </button>

      {/* ✅ Title */}
      <h2 className="text-lg font-semibold mb-4 text-center">Change Password</h2>

      {/* ✅ Old Password Input */}
      <div className="relative">
        <input 
          type={showOldPassword ? "text" : "password"}
          placeholder="Old Password"
          className="w-full border border-gray-300 rounded-[30px] px-4 py-2 mb-2"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <button onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-3">
          {showOldPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* ✅ New Password Input */}
      <div className="relative">
        <input 
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          className="w-full border border-gray-300 rounded-[30px] px-4 py-2 mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-3">
          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* ✅ Error Message */}
      {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

      {/* ✅ Update Button */}
      <button 
        className="bg-[#7db23a] text-white px-4 py-2 rounded-[30px] w-full mt-2"
        onClick={handleChangePassword} 
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default ArtistNavBar;

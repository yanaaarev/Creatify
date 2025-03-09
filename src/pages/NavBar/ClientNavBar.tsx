import { GoHomeFill } from "react-icons/go";
import { BsFillPeopleFill, BsPersonFill } from "react-icons/bs";
import { IoPersonCircleOutline, IoClose, IoMenu } from "react-icons/io5";
import { AiFillMessage } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import NotificationComponent from "../../Notifications";
import LOGO from "../../assets/logo.png";
const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";

export const NavBar = (): JSX.Element => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // Listen for real-time updates in Firestore
        const unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }
        });

        return () => unsubscribeSnapshot(); // Unsubscribe when component unmounts
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    if (user) {
      setIsDropdownOpen((prev) => !prev);
    } else {
      navigate("/login-options");
    }
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="w-screen">
      <header className="fixed inset-0 h-[94px] z-50 bg-[#19191980] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
        <div className="flex items-center justify-between h-full px-4 md:px-8 lg:px-16">
        <div className="relative p-2">
      {/* ✅ Hamburger Button for Mobile */}
      <button
        className="text-white md:hidden focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <IoClose size={32} /> : <IoMenu size={32} />} {/* Show X when open */}
      </button>

      {/* ✅ Navigation Menu (Mobile Dropdown & Desktop Flex) */}
      <div
        ref={menuRef}
        className={`absolute left-0 top-12 bg-[#191919] p-4 rounded-lg flex flex-col gap-3 z-50 md:flex md:gap-16 md:relative md:top-0 md:bg-transparent md:p-0 md:flex-row ${
          menuOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <button
          className="text-white hover:text-gray-300 focus:outline-none"
          onClick={() => handleNavigate("/")}
        >
          <GoHomeFill size={30} />
        </button>
        <button
          className="text-white hover:text-gray-300 focus:outline-none"
          onClick={() => handleNavigate("/artist-gallery")}
        >
          <BsFillPeopleFill size={30} />
        </button>
        <button
          className="text-white hover:text-gray-300 focus:outline-none"
          onClick={() => handleNavigate("/client-messages")}
        >
          <AiFillMessage size={30} />
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

          <div className="flex items-center gap-1 z-50 md:flex md:gap-6 relative p-2">
  {/* 🔔 Notification Component */}
  <NotificationComponent />

      {/* 👤 User Dropdown Button (Far Right) */}
      <div className="relative" ref={dropdownRef}>
        <button 
          className="text-white hover:text-gray-300 focus:outline-none ml-4 mt-2 md:mt-1" 
          onClick={handleLoginClick}
        >
          <BsPersonFill size={34} />
        </button>

                    {user && isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {/* Profile Section */}
                <div className="p-4 border-b border-gray-300 flex items-center space-x-3">
                  <img 
                    src={userData?.avatar || DEFAULT_AVATAR_URL} 
                    alt="Profile Avatar" 
                    className="w-12 h-12 rounded-full border border-gray-300" 
                  />
                  <div className="flex flex-col">
                    <p className="text-[#191919] font-semibold text-sm">{userData?.username || "Username"}</p>
                    <p className="text-[#19191980] text-xs truncate max-w-[140px]">{userData?.email || user?.email}</p>
                  </div>
                </div>

                {/* Dropdown Items */}
                <ul className="py-2">
                  <li 
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleNavigate("/user-dashboard")}
                  >
                    {/* ✅ Wrapped Icon in Circle Gray Background */}
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3">
                      <IoPersonCircleOutline className="text-[#191919]" />
                    </span>
                    <span className="text-[#191919] hover:underline">
                      User Dashboard
                    </span>
                  </li>

                  <hr className="border-gray-300 my-2" />

                  <li 
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" 
                    onClick={handleLogout}
                  >
                    {/* ✅ Wrapped Logout Icon in Circle Gray Background */}
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3">
                      <FiLogOut className="text-[#191919]" />
                    </span>
                    <span className="text-[#191919]">Logout</span>
                  </li>
                </ul>
              </div>
            )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default NavBar;

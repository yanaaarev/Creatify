import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { BsPersonFillCheck, BsPersonFillAdd } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { auth } from "../../config/firebaseConfig"; // Adjust path
import { signOut } from "firebase/auth";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    return false; // Sidebar starts as collapsed when refreshed or logged in
  });
  
  const [, setError] = useState("");

   // Function to check if the button is active
   const isActive = (path: string) => location.pathname === path;

   // 🔹 Handle Admin Logout
   const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      setError("Logout failed. Try again.");
    }
  };

  return (
    <>
  {/* Mobile Sidebar Toggle Button (Only Visible When Sidebar is Closed) */}
{!isOpen && (
  <button
    onClick={() => setIsOpen(true)}
    className="md:hidden fixed top-8 left-4 z-50 text-black"
  >
    <CiMenuKebab size={30} />
  </button>
)}


        {/* Sidebar */}
  <aside
    className={`h-full bg-white text-white fixed top-0 ${
      isOpen ? "w-[400px]" : "w-[150px]"
    } transition-all duration-300 flex flex-col shadow-lg 
    ${isOpen ? "left-0" : "-left-[400px] md:left-0"} md:"w-[400px]" : "w-[150px]"`}
  >
    {/* 🔹 Sidebar Header (Aligned Logo & Text) */}
    <div className="flex items-center justify-center gap-3 px-0 py-6">
      {/* 🔹 Clickable Logo (Replaces FaBars) */}
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <img
          src="/images/logo.webp"
          alt="Creatify Logo"
          className={`transition-all duration-300 ${
            isOpen ? "w-[130px] h-[130px]" : "w-[130px] h-[130px]"
          }`}
        />
      </button>

      {/* 🔹 Sidebar Title (Visible Only When Open) */}
      {isOpen && <h1 className="text-xl font-bold text-[#7db23a] pr-10">Admin Panel</h1>}
    </div>

    <nav className={`flex flex-col flex-1 mt-4 px-2 ${isOpen ? "" : "items-center"}`}>
      <button
        onClick={() => navigate("/admin-panel")}
        className={`flex items-center py-3 px-4 transition text-xl ${
          isOpen ? "gap-3" : "justify-center"
        } ${isActive("/admin-panel") ? "text-gray-600" : "text-black hover:text-gray-600"}`}
      >
        <BsPersonFillAdd className="text-[30px]" />
        {isOpen && <span>Add an Artist</span>}
      </button>

      <button
        onClick={() => navigate("/admin-artists")}
        className={`flex items-center py-3 px-4 transition text-xl ${
          isOpen ? "gap-3" : "justify-center"
        } ${isActive("/admin-artists") ? "text-gray-600" : "text-black hover:text-gray-600"}`}
      >
        <BsPersonFillCheck className="text-[30px]" />
        {isOpen && <span>Registered Artists</span>}
      </button>

      <button
        onClick={() => navigate("/admin-payments")}
        className={`flex items-center py-3 px-4 transition text-xl ${
          isOpen ? "gap-3" : "justify-center"
        } ${isActive("/admin-payments") ? "text-gray-600" : "text-black hover:text-gray-600"}`}
      >
        <HiOutlineBadgeCheck className="text-[30px]" />
        {isOpen && <span>Payment Verification</span>}
      </button>
    </nav>

    {/* 🔹 Logout Button (Centered when Sidebar is Collapsed) */}
    <div className={`px-4 pb-6 ${isOpen ? "" : "flex justify-center"}`}>
      <button
        onClick={handleLogout}
        className={`flex items-center py-3 px-4 text-black text-xl transition ${
          isOpen ? "gap-3" : "justify-center"
        }`}
      >
        <MdLogout className="text-[30px] md:mb-1" />
        {isOpen && <span>Logout</span>}
      </button>
    </div>
  </aside>
</>
  );
};

export default AdminSidebar;

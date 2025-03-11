import { IoCalendarOutline, IoChevronBackCircleOutline } from "react-icons/io5";
import { BsPersonFill } from "react-icons/bs";
import { MdHelpOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import LOGO from "/images/logo.png"; // Adjust path if needed

export const UserDashboardSidebar = (): JSX.Element => {
  const navigate = useNavigate();

  // Function to handle smooth scrolling
  const handleScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="hidden md:flex relative w-auto min-h-screen">
      {/* Sidebar Container */}
      <div className="sticky top-20 left-5 md:left-10 mt-[50px] md:mt-[100px] w-[220px] md:w-[260px] h-auto md:h-[500px] flex flex-col border border-white p-4 md:p-6 rounded-[50px] shadow-lg bg-transparent items-center">
        {/* Logo */}
        <div className="flex justify-center w-full mb-2">
          <img
            className="w-[140px] md:w-[150px] h-[40px] md:h-full"
            alt="Logo"
            src={LOGO}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col items-center w-full gap-4 md:gap-7">
          <button
            onClick={() => handleScroll("project-dashboard")}
            className="flex items-center gap-2 md:gap-3 text-white text-sm md:text-lg font-semibold hover:opacity-80"
          >
            <IoCalendarOutline className="text-white text-2xl md:text-4xl" />
            <span>Project Dashboard</span>
          </button>

          <button
            onClick={() => handleScroll("account-info")}
            className="flex items-center gap-2 md:gap-3 text-white text-sm md:text-lg font-semibold hover:opacity-80 mr-11"
          >
            <BsPersonFill className="text-white text-2xl md:text-4xl" />
            <span>Account Info</span>
          </button>

          <button
            onClick={() => handleScroll("help-support")}
            className="flex items-center gap-2 md:gap-3 text-white text-sm md:text-lg font-semibold hover:opacity-80 mr-7"
          >
            <MdHelpOutline className="text-white text-2xl md:text-4xl" />
            <span>Help & Support</span>
          </button>

          <button
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-2 md:gap-3 text-white text-sm md:text-lg font-semibold hover:opacity-80 mr-1"
          >
            <IoChevronBackCircleOutline className="text-white text-2xl md:text-4xl" />
            <span>Back to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardSidebar;

import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import the icons


type Props = {
    onUnlock: () => void;
  };
  
  const MaintenancePage: React.FC<Props> = ({ onUnlock }) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Track password visibility
    const [buttonLoading, setButtonLoading] = useState(false);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setButtonLoading(true);
      if (password === import.meta.env.VITE_MAINTENANCE_PASS) {
        onUnlock();
      } else {
        setButtonLoading(false);
        alert("Incorrect password. Try again.");
      }
    };
  
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center md:p-6 p-8 bg-gray-100">
        <h1 className="md:text-6xl text-4xl font-bold mb-4 text-gray-700"><span className="text-[#7db23a]">CREATIFY</span> IS UNDER MAINTENANCE!🚧</h1>
        <p className="mb-6 text-gray-600 font-light">We’re currently doing some updates. Come back soon!</p>
  
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <p className="text-gray-600 font-light">Are you an <span className="text-[#7db23a] font-semibold">admin</span>?</p>
        <div className="relative w-[300px]">
          <input
            type={showPassword ? "text" : "password"} // Toggle input type
            placeholder="Enter admin password"
            className="p-4 border rounded-full w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)} // Toggle showPassword state
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={buttonLoading || password === ""}
          className="bg-[#7db23a] text-white px-4 py-2 rounded-full w-[290px] hover:bg-green-700 font-semibold"
        >
          {buttonLoading ? <ClipLoader size={20} color="white" /> : "Enter Site"}
        </button>
      </form>
    </div>
    );
  };
  
  export default MaintenancePage;  
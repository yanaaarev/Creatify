import React, { useState } from "react";
import { ClipLoader } from "react-spinners";


type Props = {
    onUnlock: () => void;
  };
  
  const MaintenancePage: React.FC<Props> = ({ onUnlock }) => {
    const [password, setPassword] = useState("");
    const [error] = useState("");
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
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-gray-700">🚧 Maintenance Mode</h1>
        <p className="mb-6 text-gray-600">We’re currently doing some updates. Come back soon!</p>
  
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
          <p className="text-gray-600">Are you an admin?</p>
          <input
            type="password"
            placeholder="Enter admin password"
            className="p-4 border rounded-full w-64"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={buttonLoading || password === ""}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
          >
            {buttonLoading ? <ClipLoader size={20} color="white" /> : "Enter Site"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    );
  };
  
  export default MaintenancePage;  
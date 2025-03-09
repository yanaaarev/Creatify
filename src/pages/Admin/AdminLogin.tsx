import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const AdminLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔄 Refresh Token to Ensure Claims are Updated
      const idTokenResult = await user.getIdTokenResult(true);

      if (idTokenResult.claims.admin) {
        console.log("✅ Admin Verified!");
        navigate("/admin-panel"); // Redirect to Admin Panel
      } else {
        setError("❌ Access Denied: You are not an admin.");
      }
    } catch (err) {
      setError("❌ Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="bg-[#191919] flex justify-center w-full min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('../src/assets/authp.png')" }}></div>

      <div className="w-full max-w-[1536px] flex flex-col items-center p-4 md:p-0 relative z-10">
        {/* White Container */}
        <div className="relative w-[90%] max-w-[584px] bg-white shadow-lg rounded-[30px] p-6 flex flex-col items-center mt-11">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 text-[#8C8C8C] text-4xl"
          >
            <IoChevronBackCircleOutline />
          </button>

          <h2 className="text-[#191919] text-2xl font-semibold mt-8">Admin Login</h2>

          {/* Email Input */}
          <label className="text-[#191919] text-[17px] font-semibold mt-8">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[52px] border border-[#19191980] rounded-[30px] p-3 mt-2"
          />

          {/* Password Input */}
          <label className="text-[#191919] text-[17px] font-semibold mt-6">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[52px] border border-[#19191980] rounded-[30px] p-3 mt-2"
          />

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            className={`w-full h-[52px] bg-[#7db23a] text-white text-2xl font-semibold rounded-[30px] mt-8 ${
              !email || !password ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!email || !password}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

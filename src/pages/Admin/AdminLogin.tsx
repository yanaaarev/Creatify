import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const AdminLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);


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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/authp.png')" }}></div>

      <div className="w-full max-w-[1536px] flex flex-col items-center md:p-0 relative z-10">
        {/* White Container */}
        <div className="relative w-[100%] md:h-auto h-screen max-w-[584px] bg-white md:rounded-[30px] md:p-12 py-40 px-10 flex flex-col items-left md:mt-[120px]">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-[130px] left-4 md:top-10 md:left-6 text-[#8C8C8C] text-4xl"
          >
            <IoChevronBackCircleOutline />
          </button>

          <h2 className="text-[#191919] text-2xl font-semibold mt-8 text-center">Admin Login</h2>

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
<div className="relative w-full">
  <input
    type={passwordVisible ? "text" : "password"} // Toggle between text & password
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full h-[52px] border border-[#19191980] rounded-[30px] p-3 mt-2 pr-12"
  />
  
  {/* Show/Hide Password Button */}
  <button
    type="button"
    onClick={() => setPasswordVisible(!passwordVisible)}
    className="absolute inset-y-0 right-4 flex items-center text-gray-500 mt-2"
  >
    {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
  </button>
</div>


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

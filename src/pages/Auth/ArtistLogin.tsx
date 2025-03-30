import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

export const ArtistLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [artistIdOrEmail, setArtistIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Handle Artist Login
  const handleLogin = async () => {
    try {
      let emailToUse = artistIdOrEmail;
  
      console.log("🔍 Checking input:", artistIdOrEmail); 
  
      if (!artistIdOrEmail.includes("@")) {
        const artistRef = doc(db, "artists", artistIdOrEmail);
        const artistSnap = await getDoc(artistRef);
  
        if (!artistSnap.exists()) {
          console.error("🚨 Artist ID not found in Firestore.");
          setError("Artist ID not found.");
          return;
        }
        emailToUse = artistSnap.data().email;
      }
  
      console.log("✅ Found email:", emailToUse);
      setButtonLoading(true);
      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log("✅ Firebase Auth Success!");

         // ✅ Log successful login
    logEvent(analytics, "login", {
      method: "email_password",
      user_id: auth.currentUser?.uid || "unknown",
      role: "artist",
    });
      setButtonLoading(false);
      navigate("/artist-dashboard");
      window.location.reload();
    } catch (err) {
      setButtonLoading(false);
      console.error("❌ Login Error:", err);
      setError("Invalid credentials. Please try again.");
    }
  };  

  const updateArtistStatus = async (isOnline: boolean) => {
    if (auth.currentUser) {
      const artistRef = doc(db, "artists", auth.currentUser.uid);
      await updateDoc(artistRef, { onlineStatus: isOnline });
    }
  };
  
  // ✅ Set artist as "online" on login
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await updateArtistStatus(true);
    }
  });
  
  // ✅ Set artist as "offline" on logout
  window.addEventListener("beforeunload", async () => {
    await updateArtistStatus(false);
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Forgot Password (Send Reset Email)
  const handleForgotPassword = async () => {
    if (!artistIdOrEmail) {
      setError("Please enter your Artist ID or email first.");
      return;
    }

    try {
      let emailToUse = artistIdOrEmail;

      // If input is an artist ID, fetch the email from Firestore
      if (!artistIdOrEmail.includes("@")) {
        const artistRef = doc(db, "artists", artistIdOrEmail);
        const artistSnap = await getDoc(artistRef);

        if (!artistSnap.exists()) {
          setError("Artist ID not found.");
          return;
        }
        emailToUse = artistSnap.data().email;
      }

      await sendPasswordResetEmail(auth, emailToUse);
      alert("Password reset link sent to your email.");
    } catch (err) {
      setError("Error sending reset link. Please try again.");
    }
  };

  return (
    <div className="bg-[#191919] flex items-center justify-center w-full min-h-screen relative">
  
  {/* Responsive Background Image */}
  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
    style={{ backgroundImage: "url('/images/authp.webp')" }}></div>

  {/* White Rounded Container (Centered) */}
  <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-20 px-10 md:py-20 md:px-16 flex flex-col items-center gap-6">

    {/* Back Button */}
    <div className="flex justify-start w-full pt-20 md:pt-0">
            <IoChevronBackCircleOutline
              className="text-[#6d7167] w-[35px] h-[35px] md:w-[40px] md:h-[40px] cursor-pointer mb-3 md:mb-3"
              onClick={() => navigate(-1)}
            />
          </div>

    <div className="w-full flex flex-col items-start">
      
      {/* Title */}
      <h2 className="w-full text-[#191919] text-2xl font-semibold [font-family:'Khula',Helvetica] text-left">
        Sign in with your Artist email
      </h2>

      {/* Join Us (Redirects to Google Form) */}
      <p className="text-left text-[#191919] text-[17px] mt-2 [font-family:'Khula',Helvetica]">
        Want to be one of our artists?{" "}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScbH3ZaaJ4Jg0BCt9_0Lb9x494b1BAgbvfwwmND2wCC-h0gYg/viewform?fbclid=IwY2xjawIsdtJleHRuA2FlbQIxMAABHedzb_U7flPO_QfStOIIDnKbpHExIzU2j95DnplGb2YCtZH0xde6B0-Pug_aem_O7DnW37x0Dp61xoYWsjBzA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7db23a] hover:underline font-semibold [font-family:'Khula',Helvetica]"
        >
          Join now!
        </a>
      </p>

      {/* Artist ID / Email Input */}
      <label className="text-[#191919] text-[17px] font-semibold mt-6 [font-family:'Khula',Helvetica]">
        Artist ID or email
      </label>
      <input
        type="text"
        value={artistIdOrEmail}
        onChange={(e) => setArtistIdOrEmail(e.target.value)}
        className="w-full h-[52px] border border-[#19191980] rounded-[30px] p-3"
      />

      {/* Password Input */}
      <label className="text-[#191919] text-[17px] font-semibold mt-3 [font-family:'Khula',Helvetica]">
        Password
      </label>
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-[52px] border border-[#19191980] rounded-[30px] p-3"
        />
        {/* Show/Hide Password Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#19191980] cursor-pointer"
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>  

     {/* Forgot Password Button (Right-Aligned & Clickable Only on Text) */}
      <div className="w-full flex justify-end mt-[10px]">
        <button 
          className="text-[#19191980] text-[15px] hover:underline cursor-pointer [font-family:'Khula',Helvetica] text-right"
          onClick={handleForgotPassword}
        >
          Forgot password?
        </button>
      </div>


      {/* Error Message */}
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      {/* Sign In Button */}
      <button
        onClick={handleLogin}
        disabled={!artistIdOrEmail || !password || buttonLoading}
        className={`w-full h-[52px] text-2xl font-semibold rounded-[30px] mt-5 ${
          !artistIdOrEmail || !password
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#7db23a] text-white"
        }`}
      >
        {buttonLoading ? <ClipLoader size={20} color="white" /> : "Sign In"}
      </button>

    </div>
  </div>
</div>

  );
};

export default ArtistLogin;

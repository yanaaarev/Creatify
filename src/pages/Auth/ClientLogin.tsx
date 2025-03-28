import { useState } from "react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { auth, db } from "../../config/firebaseConfig"; // Adjust path as necessary
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

export const ClientLogin = (): JSX.Element => {
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [password, setPassword] = useState(""); // Password Field
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);


  // Validate if input is an email
  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  // Resolve username to email
  const resolveUsernameToEmail = async (
    username: string
  ): Promise<string | null> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data().email; // Assuming "email" is a field in Firestore
      }

      return null; // Username not found
    } catch (err) {
      console.error("Error resolving username:", err);
      setError(
        "An error occurred while resolving the username. Please try again."
      );
      return null;
    }
  };

  // Handle Sign In with Password
  const handleSignInWithPassword = async () => {
    setError("");
    if (!identifier || !password) {
      setError("Please enter your email/username and password.");
      return;
    }
    try {
      let userEmail: string = identifier;

      // Resolve username to email if identifier is not an email
      if (!isEmail(identifier)) {
        const resolvedEmail = await resolveUsernameToEmail(identifier);
        if (!resolvedEmail) {
          setError("Username not found. Please try again or sign up.");
          return;
        }
        userEmail = resolvedEmail;
      }
      setButtonLoading(true);
      await signInWithEmailAndPassword(auth, userEmail, password);
      console.log("✅ Login Successful!");

      // ✅ Log successful login
      logEvent(analytics, "login", {
        method: "email_password",
        user_id: auth.currentUser?.uid || "unknown",
        role: "client",
      });

      setButtonLoading(false);
      navigate("/"); // Redirect after successful login
      window.location.reload();
    } catch (err: any) {
      setButtonLoading(false);
      setError("Invalid credentials. Please check your email and password.");
    }
  };

  // ✅ Function to Handle Password Reset via Firebase
  const handleForgotPassword = async () => {
    if (!identifier) {
      alert("Please enter your email to reset the password.");
      return;
    }

    try {
      let userEmail: string = identifier;

      // ✅ If the input is a username, resolve it to an email
      if (!isEmail(identifier)) {
        const resolvedEmail = await resolveUsernameToEmail(identifier);
        if (!resolvedEmail) {
          setError("Username not found. Please try again.");
          return;
        }
        userEmail = resolvedEmail;
      }

      // ✅ Send password reset email using Firebase Auth
      await sendPasswordResetEmail(auth, userEmail);
      alert("✅ Password reset link sent! Check your email.");
    } catch (err: any) {
      console.error("❌ Error sending reset email:", err);
      setError("❌ Failed to send reset email. Please try again.");
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="bg-[#191919] flex items-center justify-center w-full min-h-screen relative">
      {/* Responsive Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/authp.png')" }}
      ></div>

      {/* White Rounded Container (Centered) */}
      <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-20 px-12 md:py-16 md:px-16 flex flex-col items-center gap-6">
        {/* Back Button */}
        <div className="w-full flex justify-start pt-[70px] md:pt-0">
          <IoChevronBackCircleOutline
            className="text-[#8C8C8C] w-[40px] h-[40px] md:w-[45px] md:h-[45px] cursor-pointer"
            onClick={() => navigate(-1)}
          />
        </div>

        {/* Centered Content */}
        <div className="flex flex-col items-center w-full gap-3">
          {/* Use Email or Username */}
          <div className="w-full flex justify-start">
            <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-xl md:text-2xl tracking-[0] leading-[34px] mb-3">
              Use your email or username to sign in
            </p>
          </div>

          {/* Email or Username */}
          <div className="w-full flex flex-col items-start gap-0">
            <label className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] md:text-md tracking-[0] leading-[34px]">
              Email or username
            </label>
            <input
              type="text"
              value={identifier}
              placeholder="Enter your email or username"
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-[100%] max-w-[490px] h-[48px] md:h-[52px] border border-solid border-[#19191980] rounded-[30px] px-4"
            />
          </div>

          {/* Password Field */}
          <div className="w-full flex flex-col items-start gap-0 relative mb-3">
            <label className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] md:text-md tracking-[0] leading-[34px]">
              Password
            </label>
            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-[100%] max-w-[490px] h-[48px] md:h-[52px] border border-solid border-[#19191980] rounded-[30px] px-4 pr-12"
              />
              {/* Show/Hide Button Inside Input Field */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            {/* 🔹 Forgot Password Link (Right-Aligned) */}
            <div className="w-full flex justify-end mt-2">
              <button
                onClick={handleForgotPassword} // ✅ Call Firebase password reset function
                className="text-gray-400 text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignInWithPassword}
            disabled={!identifier || !password || buttonLoading}
            className={`w-full max-w-[440px] h-[48px] md:h-[52px] rounded-[30px] flex items-center justify-center mb-3 ${
              !identifier || !password
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7db23a] cursor-pointer"
            }`}
          >
            <span className="[font-family:'Khula',Helvetica] font-semibold text-white text-xl md:text-2xl mt-2">
            {buttonLoading ? <ClipLoader size={20} color="white" /> : "Sign In"}
            </span>
          </button>
        </div>

        {/* Terms and Privacy Policy (Smaller for Mobile) */}
        <p className="[font-family:'Khula',Helvetica] font-normal text-[#19191980] text-[11px] md:text-[13px] tracking-[0] leading-[15.6px] text-left">
          By joining <span className="font-semibold">Creatify</span>, you agree
          to our{" "}
          <button className="[font-family:'Khula',Helvetica] font-semibold hover:underline" onClick={() => handleNavigate("/terms-and-conditions")}>
            Terms of Service
          </button>{" "}
          and acknowledge that you may occasionally receive emails from us. For
          details on how we protect and use your personal information, please
          review our{" "}
          <button className="[font-family:'Khula',Helvetica] font-semibold hover:underline" onClick={() => handleNavigate("/privacy-policy")}>
            Privacy Policy
          </button>
          .
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 [font-family:'Khula',Helvetica] text-sm text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;

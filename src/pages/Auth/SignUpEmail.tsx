import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig"; // Firebase config import
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const SignUpEmail = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For status messages
  const [isVerificationPending, setIsVerificationPending] = useState(false); // Verification state
  const navigate = useNavigate();

  // 🔄 Handle Input Changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  // 🔥 Handle Sign-Up Process
  const handleContinue = async () => {
    setError("");
    setMessage("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // 🔍 Validate Email Format
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 🔍 Password Minimum Length Check
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // 🔍 Check if Passwords Match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // ✅ Create User Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // ✅ Send Email Verification
      await sendEmailVerification(user);
      alert("Verification email sent! Please verify your email before proceeding.");

      // ✅ Save User Info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        createdAt: new Date().toISOString(),
      });

      setIsVerificationPending(true);
    } catch (err: any) {
      console.error("Error saving user info:", err);

      if (err.code === "auth/email-already-in-use") {
        alert("This email is already in use. Please log in instead.");
      } else {
        alert(err.message || "An error occurred. Please try again.");
      }
    }
  };

  // 🔄 Handle Email Verification Check
  const handleVerificationCheck = async () => {
    setError("");
    setMessage("");

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload(); // Refresh user data
        if (auth.currentUser.emailVerified) {
          setMessage("Email verified successfully! Proceeding...");
          navigate("/signup-final", { state: { email, password } });
          window.location.reload();
        } else {
          setError("Your email is not verified yet. Please check your inbox.");
        }
      } else {
        setError("No user found. Please sign up again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-[#191919] flex items-center justify-center w-full min-h-screen relative">
  
    {/* Responsive Background Image */}
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: "url('/images/authp.png')" }}></div>
  
    {/* White Rounded Container (Centered) */}
    <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-20 px-12 md:py-16 md:px-16 flex flex-col items-center gap-6">
          {/* Back Button */}
          <div className="flex justify-start w-full pt-[50px] md:pt-0">
            <IoChevronBackCircleOutline
              className="text-[#8C8C8C] w-[45px] h-[45px] cursor-pointer"
              onClick={() => navigate(-1)}
            />
          </div>

          {/* Header Text */}
          <div className="w-full flex justify-start">
            <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-xl md:text-2xl">
              Continue with your email to sign up
            </p>
          </div>

          {/* Email Field */}
          <div className="w-full flex flex-col items-start relative">
            <label className="text-[#191919] text-[17px] font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full h-[48px] md:h-[52px] border border-[#19191980] rounded-[30px] px-4"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="w-full flex flex-col items-start relative">
            <label className="text-[#191919] text-[17px] font-semibold">Password</label>
            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full h-[48px] md:h-[52px] border border-[#19191980] rounded-[30px] px-4 pr-12"
                placeholder="Enter your password"
              />
              {/* Show/Hide Button */}
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4">
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="w-full flex flex-col items-start relative">
            <label className="[font-family:'Khula',Helvetica] text-[#191919] text-[17px] font-semibold">Confirm Password</label>
            <div className="w-full relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full h-[48px] md:h-[52px] border border-[#19191980] rounded-[30px] px-4 pr-12"
                placeholder="Re-enter your password"
              />
              {/* Show/Hide Button */}
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-4">
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <div className="w-full flex justify-center">
            <button 
              onClick={handleContinue} 
              disabled={!email || !password || !confirmPassword} // ✅ Disable button when fields are empty
              className={`font-semibold py-3 text-xl w-full max-w-[450px] h-[45px] rounded-[30px] ${
                !email || !password || !confirmPassword 
                  ? "bg-gray-400 text-white cursor-not-allowed" // 🔥 Disabled state
                  : "bg-[#7db23a] text-white" // ✅ Enabled state
              }`}
            >
              Continue
            </button>
          </div>


          {/* ✅ Check Verification Button (FIXED) */}
          {isVerificationPending && (
            <div className="w-full flex justify-center mt-[-15px]">
              <button onClick={handleVerificationCheck} className="w-full py-2 max-w-[450px] h-[40px] font-semibold border border-solid border-[#7db23a] text-lg text-[#7db23a] rounded-[30px]">
                Verify Email
              </button>
            </div>
          )}

        {/* Terms and Privacy Policy (Smaller for Mobile) */}
        <p className="[font-family:'Khula',Helvetica] font-normal text-[#19191980] text-[11px] md:text-[13px] tracking-[0] leading-[15.6px] text-left">
            By joining <span className="font-semibold">Creatify</span>, you agree to our{" "}
            <span className="[font-family:'Khula',Helvetica] font-semibold">Terms of Service</span> and acknowledge that you may occasionally receive emails from us. 
            For details on how we protect and use your personal information, please review our{" "}
            <span className="[font-family:'Khula',Helvetica] font-semibold">Privacy Policy</span>.
          </p>

          {/* ✅ Message & Error */}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
  );
};

export default SignUpEmail;

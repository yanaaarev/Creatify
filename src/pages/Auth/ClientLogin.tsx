import { useState, useRef } from "react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { auth, db } from "../../config/firebaseConfig"; // Adjust path as necessary
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { getDocs, collection, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

export const ClientLogin = (): JSX.Element => {
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [password, setPassword] = useState(""); // Password Field
  const [error] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userDocId, setUserDocId] = useState<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  // Enable checkbox when user scrolls
  const handleScroll = () => {
    if (!contractRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolled(true);
    }
  }

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
      alert(
        "An error occurred while resolving the username. Please try again."
      );
      return null;
    }
  };

  const checkTermsAgreement = async (userEmail: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      setUserDocId(userDoc.id);
      return userDoc.data().agreedToTerms || false;
    }
    return false;
  };

  // Handle Sign In with Password
  const handleSignInWithPassword = async () => {
    alert("");
    if (!identifier || !password) {
      alert("Please enter your email/username and password.");
      return;
    }
  
    try {
      let userEmail = identifier;
      if (!isEmail(identifier)) {
        const resolvedEmail = await resolveUsernameToEmail(identifier);
        if (!resolvedEmail) {
          alert("Username not found.");
          return;
        }
        userEmail = resolvedEmail;
      }
  
      setButtonLoading(true);
  
      // Ensure user exists in Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      if (!userCredential.user) {
        throw new Error("Invalid credentials.");
      }
  
      // Check if user has agreed to terms
      const hasAgreed = await checkTermsAgreement(userEmail);
      if (!hasAgreed) {
        setShowTerms(true);
        setButtonLoading(false);
        return;
      }
  
      logEvent(analytics, "login", { method: "email_password", user_id: userCredential.user.uid, role: "client" });
      setButtonLoading(false);
      navigate("/");
      window.location.reload();
    } catch (err: any) {
      console.error("Login error:", err);
      setButtonLoading(false);
      alert(err.message || "Invalid credentials.");
    }
  };
  

  const handleAgreeToTerms = async () => {
    if (userDocId) {
      await updateDoc(doc(db, "users", userDocId), { agreedToTerms: true, agreedAt: serverTimestamp() });
    }
    setShowTerms(false);
    handleSignInWithPassword();
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
          alert("Username not found. Please try again.");
          return;
        }
        userEmail = resolvedEmail;
      }

      // ✅ Send password reset email using Firebase Auth
      await sendPasswordResetEmail(auth, userEmail);
      alert("✅ Password reset link sent! Check your email.");
    } catch (err: any) {
      console.error("❌ Error sending reset email:", err);
      alert("❌ Failed to send reset email. Please try again.");
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

  return (
    <div className="bg-[#191919] flex items-center justify-center w-full min-h-screen relative">
      {/* Responsive Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/authp.webp')" }}
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

        {/* Terms and Agreement Modal */}
      {showTerms && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {/* Close Button - Positioned at the Outer Right */}
        <button 
          className="absolute top-4 right-4 text-4xl text-black md:text-white hover:text-gray-300"
          onClick={handleLogout}
        >
          ✖
        </button>
          <div className="bg-white w-full h-full md:max-h-[650px] md:max-w-[1000px] md:rounded-[30px] shadow-[30px] py-20 px-5 md:p-10">
            <div ref={contractRef} onScroll={handleScroll} className="bg-[#191919] bg-opacity-[10%] p-8 md:p-10 h-[450px] md:h-[450px] overflow-y-auto border border-gray-300 rounded-[30px]">
              <p className="text-5xl text-center font-bold [font-family:'Khula',Helvetica]">CREATIFY CLIENT TERMS AND AGREEMENT</p>
              <p className="text-lg md:text-[15px] mt-6 leading-[40px] md:leading-[30px] [font-family:'Khula',Helvetica]">By using <span className="font-bold [font-family:'Khula',Helvetica]">Creatify</span>, you agree to the following terms:<br></br><br></br> 
            (This platform is part of a <span className="font-bold [font-family:'Khula',Helvetica]">capstone project</span> focused on testing and gathering data on a creative service platform. By using Creatify, you acknowledge that it is an academic project and may undergo changes or improvements.)<br></br><br></br> 
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">1. Platform Fee</span><br></br>
              &nbsp;&nbsp;&nbsp;•	A <span className="font-bold [font-family:'Khula',Helvetica]">₱50</span> platform fee is charged only when an invoice is sent for a transaction.<br></br>
              &nbsp;&nbsp;&nbsp;•	Booking an artist is free; the platform fee applies only when proceeding with a commission.<br></br>
              &nbsp;&nbsp;&nbsp;•	This fee supports platform maintenance and is non-refundable once charged.<br></br><br></br>
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">2. Payment & Refund Policy</span><br></br>
            &nbsp;&nbsp;&nbsp;•	Clients are required to pay the full commission price as per the invoice sent by the artist.<br></br>
            &nbsp;&nbsp;&nbsp;•	Once a transaction has started, refunds will not be issued if the client decides to cancel.<br></br>
            &nbsp;&nbsp;&nbsp;•	If a transaction has not yet begun, the client and artist may discuss a mutual cancellation.<br></br>
            &nbsp;&nbsp;&nbsp;•	If an artist fails to deliver the agreed work, Creatify may review the case and take necessary action.<br></br><br></br>
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">3. Payment Release Process</span><br></br>
            &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">First Payment Release</span>: The 50% down payment is transferred to the Artist upon confirmation of substantial progress (e.g., an initial draft, sketch, or progress update).<br></br>
            &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Final Payment Release</span>: The remaining 50% balance is transferred once the Client confirms the final deliverables and approves the completed work.<br></br><br></br>
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">4. Commission Ownership & Usage</span><br></br>
            &nbsp;&nbsp;&nbsp;•	The artist retains ownership of the commissioned work unless a commercial license or transfer of rights is agreed upon.<br></br>
            &nbsp;&nbsp;&nbsp;•	Clients cannot resell, modify, or redistribute the work without the artist’s explicit permission.<br></br>
            &nbsp;&nbsp;&nbsp;•	If an artist provides specific terms for their work, the client must respect and follow those terms.<br></br><br></br>
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">5. Client Responsibilities</span><br></br>
            &nbsp;&nbsp;&nbsp;•	Clients must communicate professionally and respectfully with artists.<br></br>
            &nbsp;&nbsp;&nbsp;•	Ghosting an artist (failing to respond without notice) may result in account suspension or banning.<br></br>
            &nbsp;&nbsp;&nbsp;•	Clients must provide clear instructions and expectations when commissioning work.<br></br>
            &nbsp;&nbsp;&nbsp;•	Payment must be completed as per the agreed terms to avoid disputes.<br></br><br></br>
            
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">6. Dispute Resolution</span><br></br>
            &nbsp;&nbsp;&nbsp;•	Clients and artists should first attempt to resolve disputes directly.<br></br>
            &nbsp;&nbsp;&nbsp;•	If unresolved, Creatify may review the situation but is not responsible for arbitration or legal matters.<br></br><br></br>
           
            <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">7. Account Suspension & Termination</span><br></br>
            &nbsp;&nbsp;&nbsp;•	Clients who repeatedly violate terms, ghost artists, or engage in misconduct may have their accounts suspended or permanently banned.<br></br>
            &nbsp;&nbsp;&nbsp;•	Creatify reserves the right to update these terms as necessary. Continued use of the platform constitutes acceptance of any updates.</p>
              <p className="text-lg md:text-[15px] mt-6">By proceeding, you confirm that you have read and agreed to the <span className="font-bold [font-family:'Khula',Helvetica]">Terms and Agreement</span>. If you do not agree to these terms, you may not proceed or create an account.</p>
            </div>
            <div className="mt-4 p-4 flex flex-col items-center">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="termsCheckbox" disabled={!hasScrolled} checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="termsCheckbox" className="text-lg md:text-[15px]">I have read and agree to the <span className="font-bold [font-family:'Khula',Helvetica]">Terms and Agreement</span></label>
              </div>
              <button onClick={handleAgreeToTerms} disabled={!agreedToTerms} className={`mt-4 px-6 py-2 w-full rounded-full text-lg md:text-[18px] font-semibold text-white ${agreedToTerms ? "bg-[#7db23a]" : "bg-gray-400 cursor-not-allowed"}`}>Continue</button>
            </div>
          </div>
        </div>
      )}

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

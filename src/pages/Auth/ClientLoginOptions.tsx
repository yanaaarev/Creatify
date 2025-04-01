import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md"; // Email icon
import { FcGoogle } from "react-icons/fc"; // Google icon
import { auth, db } from "../../config/firebaseConfig"; // Firebase config
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";
import { ClipLoader } from "react-spinners";

export const ClientLoginOptions = (): JSX.Element => {
  const navigate = useNavigate();
    const [showTerms, setShowTerms] = useState(false); // Show terms modal first
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [userDocId, setUserDocId] = useState<string | null>(null);
    const contractRef = useRef<HTMLDivElement>(null);
    const [buttonLoading, setButtonLoading] = useState(false);


// Enable checkbox when user scrolls
const handleScroll = () => {
  if (!contractRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    setHasScrolled(true);
  }
};

  // Handle Google Login
const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("User successfully logged in with Google:", user);

    // ✅ Log Google login event
    logEvent(analytics, "login", {
      method: "google",
      user_id: user.uid,
      role: "client",
    });

    // Check if the user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User exists in Firestore:", userData);

      // ✅ Check if user has agreed to terms
      if (userData.agreedToTerms) {
        navigate("/");
        window.location.reload();
      } else {
        setShowTerms(true); // Show contract overlay
        setUserDocId(user.uid); // Save user ID for agreement update
      }
    } else {
      console.log("User does not exist in Firestore. Creating new user record...");
      
      // Create new user document with `agreedToTerms: false`
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        provider: "google",
        createdAt: serverTimestamp(),
        role: "client",
        agreedToTerms: false, // Require agreement
      });

      setShowTerms(true); // Show contract overlay for agreement
      setUserDocId(user.uid); // Save user ID for agreement update
    }
  } catch (error: any) {
    console.error("Google login failed:", error);
    alert("Google login failed. Please try again.");
  }
};

// Handle agreeing to terms
const handleAgreeToTerms = async () => {
  setButtonLoading(true); // Show loading spinner
  if (userDocId) {
    try {
      await updateDoc(doc(db, "users", userDocId), {
        agreedToTerms: true,
        agreedAt: serverTimestamp(),
      });

      setButtonLoading(false); // Hide loading spinner
      setShowTerms(false); // Hide contract overlay
      navigate("/"); // Proceed after agreement
      window.location.reload();
    } catch (error) {
      console.error("Error updating agreement status:", error);
      alert("Failed to update agreement status. Please try again.");
    }
  }
};


  const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate("/");
        } catch (error) {
          console.error("Logout failed:", error);
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
  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
    style={{ backgroundImage: "url('/images/authp.webp')" }}></div>

  {/* White Rounded Container (Centered) */}
  <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-20 px-10 md:py-20 md:px-16 flex flex-col items-center gap-6">
          
          {/* Back Button */}
          <div className="flex justify-start w-full pt-[150px] md:pt-0">
            <IoChevronBackCircleOutline
              className="text-[#6d7167] w-[35px] h-[35px] md:w-[45px] md:h-[45px] cursor-pointer md:mb-1"
              onClick={() => navigate(-1)}
            />
          </div>

          {/* Sign In Section (Smaller Text on Mobile) */}
          <div className="w-full max-w-[400px] md:max-w-[490px] flex flex-col">
            <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-2xl tracking-[0] leading-[34px] mb-3 md:mb-4">
              Sign in to your account
            </p>

            <div className="flex items-center -mt-2 md:-mt-4">
              <p className="[font-family:'Khula',Helvetica] font-normal text-[#191919] text-[17px] tracking-[0] leading-[normal]">
                Don’t have an account?
              </p>
              <button
                onClick={() => navigate("/signup-options")}
                className="[font-family:'Khula',Helvetica] font-semibold text-[#7db23a] text-[17px] tracking-[0] leading-[normal] ml-2 cursor-pointer"
              >
                Join us free
              </button>
            </div>
          </div>

          {/* Buttons Section (Reduced Width & Height for Mobile) */}
          <div className="w-full max-w-[380px] md:max-w-[490px] flex flex-col gap-2">
            {/* Continue with Google */}
            <button
              onClick={() => handleGoogleLogin()}
              className="w-full h-[46px] md:h-[52px] border border-solid border-[#19191980] rounded-[30px] flex items-center cursor-pointer"
            >
              <FcGoogle className="ml-4 w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />
              <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] tracking-[0] leading-[34px] ml-4 mt-1">
                Continue with Google
              </p>
            </button>

            {/* Continue with Email */}
            <button
              onClick={() => navigate("/client-signin")}
              className="w-full h-[46px] md:h-[52px] border border-solid border-[#19191980] rounded-[30px] flex items-center cursor-pointer bg-transparent"
            >
              <MdOutlineEmail className="ml-4 w-[22px] h-[22px] md:w-[26px] md:h-[26px] text-[#191919]" />
              <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] tracking-[0] leading-[34px] ml-4 mt-1">
                Continue with email/username
              </p>
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
              <button onClick={handleAgreeToTerms} disabled={!agreedToTerms || !hasScrolled || buttonLoading} className={`mt-4 px-6 py-2 w-full rounded-full text-lg md:text-[18px] font-semibold text-white ${agreedToTerms ? "bg-[#7db23a]" : "bg-gray-400 cursor-not-allowed"}`}>{buttonLoading ? <ClipLoader size={20} color="white" /> : "Continue"}</button>
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
        </div>
      </div>
  );
};

export default ClientLoginOptions;

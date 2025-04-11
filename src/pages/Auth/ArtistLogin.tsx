import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig";
import { getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

export const ArtistLogin = (): JSX.Element => {
  const navigate = useNavigate();
  const [artistIdOrEmail, setArtistIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  // ✅ State for Contract Overlay
  const [showContract, setShowContract] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const checkArtistAgreement = async () => {
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
  
      try {
        const artistRef = doc(db, "artists", auth.currentUser.uid);
        const artistSnap = await getDoc(artistRef);
  
        if (artistSnap.exists() && artistSnap.data().agreedToTerms) {
          setAgreedToTerms(true);
          setShowContract(false); // ✅ Ensure the contract overlay is hidden
        } else {
          setShowContract(true);
        }
      } catch (error) {
        console.error("Error checking artist agreement:", error);
      }
    };
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkArtistAgreement(); // ✅ Call the function only after the user is authenticated
      }
    });
  
    return () => unsubscribe(); // ✅ Clean up the listener
  }, []);
  
// Enable checkbox when user scrolls
const handleScroll = () => {
  if (!contractRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    setHasScrolled(true);
  }
};

  // Handle Artist Login
  const handleLogin = async () => {
    try {
      let emailToUse = artistIdOrEmail;
  
      if (!artistIdOrEmail.includes("@")) {
        const artistRef = doc(db, "artists", artistIdOrEmail);
        const artistSnap = await getDoc(artistRef);
  
        if (!artistSnap.exists()) {
          alert("Artist ID not found.");
          return;
        }
        emailToUse = artistSnap.data().email;
      }
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const user = userCredential.user;
      setButtonLoading(true);
      // Check if artist has agreed to terms
      const artistRef = doc(db, "artists", user.uid);
      const artistSnap = await getDoc(artistRef);

      if (artistSnap.exists() && artistSnap.data().agreedToTerms) {
         // ✅ Log successful login
    logEvent(analytics, "login", {
      method: "email_password",
      user_id: auth.currentUser?.uid || "unknown",
      role: "artist",
    });
        setButtonLoading(false);
        navigate("/artist-dashboard");
        window.location.reload();
      } else {
        setShowContract(true);
      }
    } catch (err) {
      setButtonLoading(false);
      alert("Invalid credentials. Please try again.");
    }
  };

   // ✅ Handle Agreement & Update Firestore
   const handleAgreeToTerms = async () => {
    if (!fullName.trim()) {
      alert("Please enter your full name to proceed.");
      return;
    }

    if (!agreedToTerms) {
      alert("You must agree to the terms to proceed.");
      return;
    }
    
    if (auth.currentUser) {
      const artistRef = doc(db, "artists", auth.currentUser.uid);
      await updateDoc(artistRef, {
        agreedToTerms: true,
        agreedAt: serverTimestamp(),
      });
      setShowContract(false);
      navigate("/artist-dashboard");
      window.location.reload();
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
      alert("Please enter your Artist ID or email first.");
      return;
    }

    try {
      let emailToUse = artistIdOrEmail;

      // If input is an artist ID, fetch the email from Firestore
      if (!artistIdOrEmail.includes("@")) {
        const artistRef = doc(db, "artists", artistIdOrEmail);
        const artistSnap = await getDoc(artistRef);

        if (!artistSnap.exists()) {
          alert("Artist ID not found.");
          return;
        }
        emailToUse = artistSnap.data().email;
      }

      await sendPasswordResetEmail(auth, emailToUse);
      alert("Password reset link sent to your email.");
    } catch (err) {
      alert("Error sending reset link. Please try again.");
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


  return (
    <div className="flex items-center justify-center w-full min-h-screen relative">

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
            className="w-full h-[52px] text-xl font-semibold rounded-[30px] mt-5 bg-[#7db23a] text-white"
          >
            {buttonLoading ? <ClipLoader size={20} color="white" /> : "Sign In"}
          </button>
        </div>
      </div>

      {/* Contract Overlay */}
      {showContract && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       {/* Close Button */}
      <button 
        className="absolute top-4 right-4 text-4xl text-black md:text-white hover:text-gray-300"
        onClick={handleLogout}
      >
        ✖
      </button>

       <div className="bg-white w-full h-full md:max-h-[700px] md:max-w-[1000px] md:rounded-[30px] shadow-[30px] py-16 px-5 md:p-10">
         <div ref={contractRef} onScroll={handleScroll} className="bg-[#191919] bg-opacity-[10%] p-8 md:p-10 h-[450px] md:h-[450px] overflow-y-auto border border-gray-300 rounded-[30px]">
           <p className="text-5xl text-center font-bold [font-family:'Khula',Helvetica]">CREATIFY ARTIST AGREEMENT</p>
           <p className="text-lg md:text-[15px] mt-6 leading-[40px] md:leading-[30px] [font-family:'Khula',Helvetica]"><span className="font-semibold italic [font-family:'Khula',Helvetica]">(For Capstone Project Participation)</span><br></br><br></br>
           This <span className="font-bold [font-family:'Khula',Helvetica]">Creatify Artist Agreement</span> (“Agreement”) is made between <span className="font-bold [font-family:'Khula',Helvetica]">Creatify</span> (“Platform”) and the undersigned <span className="font-bold [font-family:'Khula',Helvetica]">Artist</span> for participation in a <span className="font-bold [font-family:'Khula',Helvetica]">capstone project</span>.<br></br><br></br> 
         
         <p className="md:text-[15px] leading-[40px] md:leading-[35px] [font-family:'Khula',Helvetica]">
           <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">1. Introduction</span><br></br>
           &nbsp;&nbsp;&nbsp;•	Creatify is a capstone project designed for academic purposes, focusing on testing and gathering data on a creative 
           service platform. As an Artist, you are volunteering to participate in this project until the end of April. After this period, 
           any continuation of the platform and artist involvement will be subject to further discussion.<br></br>
           &nbsp;&nbsp;&nbsp;•	This agreement is a formality, as Creatify serves only as a medium for transactions between clients and artists. You are not 
           restricted from taking on other jobs or working outside of Creatify. Your personal information and data are secure and 
           will not be shared outside the platform.<br></br><br></br>
         
        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">2. Artist Obligations & Responsibilities</span><br></br>
        As a Creatify Artist, you agree to:<br></br>
         &nbsp;&nbsp;&nbsp;•	Maintain professionalism and ethical conduct when interacting with clients.<br></br>
         &nbsp;&nbsp;&nbsp;•	Provide high-quality services as per the agreed-upon commission details.<br></br>
         &nbsp;&nbsp;&nbsp;•	Complete projects within the specified deadlines.<br></br>
         &nbsp;&nbsp;&nbsp;•	Regularly update clients on project progress.<br></br>
         &nbsp;&nbsp;&nbsp;•	Follow the platform’s rules and policies, including fair treatment of clients.<br></br><br></br>
         
        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">3. Data Gathering & Documentation</span><br></br>
         &nbsp;&nbsp;&nbsp;•	As part of this capstone project, the Artist’s participation will be included in the platform’s data gathering for academic 
         purposes.<br></br>
         &nbsp;&nbsp;&nbsp;•	The Artist’s name will be documented as part of the research and findings for this project.<br></br>
         &nbsp;&nbsp;&nbsp;•	This data will only be used within the scope of the capstone project and for evaluating the platform’s performance.<br></br><br></br>
         
        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">4. Duration & Termination</span><br></br>
        Artists may leave the platform under the following conditions:<br></br>
         &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Project End</span>: The official participation period ends in April, but Artists may choose to continue using the platform beyond that.<br></br>
         &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Voluntary Exit</span>: Artists may leave at any time, provided they have no ongoing transactions with a client.<br></br>
         &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Forced Termination</span>: Artists may be removed from the platform if they repeatedly fail to follow platform rules or engage in misconduct.<br></br><br></br>
         
        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">5. Payment Structure</span><br></br>
         &nbsp;&nbsp;&nbsp;•	Clients make a 50% down payment upon finalizing details before work begins.<br></br>
         &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">First Payment Release</span>: The 50% down payment is transferred to the Artist only upon confirmation of substantial progress (e.g., an initial draft, sketch, or progress update).<br></br>
         &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Final Payment Release</span>: The remaining 50% balance is transferred once the Client confirms the final deliverables and approves the completed work.<br></br>
         &nbsp;&nbsp;&nbsp;•	Payments are processed through Creatify for security and transparency. Instead of a percentage-based fee, a fixed ₱50 platform fee is applied per invoice. This is the only additional charge outside the commission price.<br></br><br></br>
         
        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">6. Cancellations & Refund Policy</span><br></br>
         &nbsp;&nbsp;&nbsp;•	Once a transaction has started, the client cannot receive a refund if they cancel the commission.<br></br>
         &nbsp;&nbsp;&nbsp;•	If unresolved, Creatify may review the situation but is not responsible for arbitration or legal matters.<br></br><br></br>
        
         <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">7. No-Show & Abandonment Policy</span><br></br>
         &nbsp;&nbsp;&nbsp;•	If an Artist fails to communicate or abandons a project, they may face suspension or removal from the platform.<br></br>
         &nbsp;&nbsp;&nbsp;•	In case of disputes, the platform reserves the right to review the situation and take appropriate action.<br></br><br></br>
         
         <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">8. Ownership & Intellectual Property Rights</span><br></br>
         &nbsp;&nbsp;&nbsp;•	Artists retain full intellectual property rights over their commissioned work unless otherwise agreed with the client.<br></br>
         &nbsp;&nbsp;&nbsp;•	Clients are granted a non-exclusive license to use the commissioned work only for its intended purpose.<br></br>
         &nbsp;&nbsp;&nbsp;•	Unauthorized resale, modification, or redistribution of the artwork without the Artist’s consent is prohibited.<br></br><br></br>
         
         <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">9. Dispute Resolution</span><br></br>
         &nbsp;&nbsp;&nbsp;•	Artists and clients should communicate in good faith to resolve any conflicts.<br></br>
         &nbsp;&nbsp;&nbsp;•	If no resolution is reached, the platform may review the case and enforce its policies but is not responsible for arbitration beyond this.<br></br><br></br>

         <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">10. Certification & Incentive</span><br></br>
         &nbsp;&nbsp;&nbsp;•	Artists <span className="font-bold [font-family:'Khula',Helvetica]">who fully comply and actively participate until April</span> will receive:<br></br>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;○ <span className="font-bold [font-family:'Khula',Helvetica]">E-Certificate of Appreciation</span><br></br>
         &nbsp;&nbsp;&nbsp;•	This policy ensures fairness to those who commit their time and effort to the project.<br></br><br></br>

        <span className="font-bold text-3xl [font-family:'Khula',Helvetica]">11. Help & Support</span><br></br>
        For any questions or assistance, you can reach out to us through:<br></br>
        &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Email:</span> ask.creatify@gmail.com<br></br>
        &nbsp;&nbsp;&nbsp;•	<span className="font-bold [font-family:'Khula',Helvetica]">Viber Group Chat</span></p></p>
           <p className="text-lg md:text-[15px] mt-6 text-center">By proceeding, you acknowledge that you have read, understood, and agreed to the terms stated above. You also confirm that you understand that <span className="font-bold [font-family:'Khula',Helvetica]">this is a capstone project</span> and that your participation is <span className="font-bold [font-family:'Khula',Helvetica]">voluntary</span>. If you do not agree to these terms, <span className="font-bold [font-family:'Khula',Helvetica]">you may not proceed or login to your artist account.</span></p>
         </div>
         <div className="p-4 flex flex-col items-center">
           <div className="flex items-center gap-2 mt-2 mb-2">
             <input type="checkbox" id="termsCheckbox" disabled={!hasScrolled} checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} className="w-4 h-4 cursor-pointer" />
             <label htmlFor="termsCheckbox" className="text-lg md:text-[15px]">I have read and agree to the <span className="font-bold [font-family:'Khula',Helvetica]">Terms and Agreement</span></label>
           </div>
           <input 
              type="text" 
              placeholder="Enter your full name to confirm" 
              className="w-full border border-[#191919] border-opacity-30 mt-2 mb-2 p-3 rounded-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
           <button
          onClick={handleAgreeToTerms}
          disabled={!agreedToTerms || !fullName }
          className={`mt-4 px-6 py-2 w-full rounded-full text-lg md:text-[18px] font-semibold text-white ${
            agreedToTerms && fullName ? "bg-[#7db23a]" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Proceed
        </button>
         </div>
       </div>
     </div>
   )}
</div>

  );
};

export default ArtistLogin;

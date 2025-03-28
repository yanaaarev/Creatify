import { useNavigate } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md"; // Email icon
import { FcGoogle } from "react-icons/fc"; // Google icon
import { auth, db } from "../../config/firebaseConfig"; // Firebase config
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

export const ClientLoginOptions = (): JSX.Element => {
  const navigate = useNavigate();

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

      // Check if the user exists in the Firestore database
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("User exists in Firestore:", userDoc.data());
        // Navigate to the homepage if the user exists
        navigate("/");
        window.location.reload();
      } else {
        console.log("User does not exist in Firestore. Redirecting to sign-up.");
        // Redirect to SignUpFinal to collect additional information
        navigate("/signup-final", {
          state: { email: user.email },
        });
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
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
    style={{ backgroundImage: "url('/images/authp.png')" }}></div>

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

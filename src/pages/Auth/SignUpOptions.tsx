import { IoChevronBackCircleOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { auth } from "../../config/firebaseConfig";

const db = getFirestore();

export const SignUpOptions = (): JSX.Element => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In Success:", user);

      // Save the user to Firestore
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, {
        email: user.email,
        displayName: user.displayName,
        provider: "google",
        createdAt: new Date().toISOString(),
        role: "client",
      });

      // Redirect to SignUpFinal and pass necessary state
      navigate("/signup-final", { state: { email: user.email } });
      window.location.reload();
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
      alert("Google sign-in failed. Please try again.");
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
                onClick={() => navigate(-1)} // Go back to the previous page
              />
            </div>

            {/* Create Account Text */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[490px]">
                <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-2xl tracking-[0] leading-[34px]">
                  Create an account
                </p>
              </div>
            </div>

            {/* "Already Have an Account?" */}
            <div className="w-full flex justify-center mt-[-25px]">
              <div className="w-full max-w-[490px] flex items-center">
                <p className="[font-family:'Khula',Helvetica] font-normal text-[#191919] md:text-[17px] tracking-[0] leading-[normal]">
                  Already have an account?
                </p>
                <button
                  onClick={() => navigate("/client-login")}
                  className="[font-family:'Khula',Helvetica] font-semibold text-[#0098d0] md:text-[17px] tracking-[0] leading-[normal] ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>

            {/* Continue with Google */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[490px]">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full h-[52px] border border-solid border-[#19191980] rounded-[30px] flex items-center cursor-pointer"
                >
                  <FcGoogle className="ml-4 w-[26px] h-[26px]" />
                  <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] tracking-[0] leading-[34px] ml-4 mt-1">
                    Continue with Google
                  </p>
                </button>
              </div>
            </div>

            {/* Continue with Email */}
            <div className="w-full flex justify-center mt-[-16px]">
              <div className="w-full max-w-[490px]">
                <button
                  onClick={() => navigate("/signup-email")}
                  className="w-full h-[52px] border border-solid border-[#19191980] rounded-[30px] flex items-center cursor-pointer bg-transparent"
                >
                  <MdOutlineEmail className="ml-4 w-[26px] h-[26px] text-[#191919]" />
                  <p className="[font-family:'Khula',Helvetica] font-semibold text-[#191919] text-[17px] tracking-[0] leading-[34px] ml-4 mt-1">
                    Continue with email
                  </p>
                </button>
              </div>
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

export default SignUpOptions;

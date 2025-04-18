import { useState, useEffect } from "react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig"; // Import Firebase config
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
import { onAuthStateChanged } from "firebase/auth";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

interface LocationState {
  email?: string;
}

export const SignUpFinal = (): JSX.Element => {
  const [username, setUsername] = useState("");
  const [error] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState; // Explicitly type location.state
  const { email } = state || {};
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (!userDoc.exists() || !userDoc.data().agreedToTerms) {
          alert("You must agree to the terms before proceeding.");
          navigate("/signup-options"); // Redirect if agreement is missing
        }
      } else {
        alert("You need to log in to complete registration.");
        navigate("/signup-options");
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);  

  useEffect(() => {
    if (!email) {
      alert("Missing email. Please start the sign-up process again.");
      navigate("/signup-options"); // Redirect back to options
    }
  }, [email, navigate]);

  const handleCreateAccount = async () => {
    if (!username) {
      alert("Please enter a username.");
      return;
    }

    try {
      if (!uid) {
        throw new Error("Authentication error. Please log in again.");
      }

    setButtonLoading(true);

      const userDocRef = doc(db, "users", uid);

      // Check if the document exists
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userDocRef, {
          email: email || "", // Use the provided email or an empty string
          createdAt: new Date().toISOString(),
          role: "client", // 🔹 Assign "client" role
        });
      } else {
        // 🔹 Ensure the role is set to "client" for existing documents
        const userData = userDoc.data();
        if (!userData.role) {
          await updateDoc(userDocRef, {
            role: "client",
          });
        }
      }

      // Update Firestore with the username
      await updateDoc(userDocRef, {
        username,
      });

      console.log("User profile updated successfully with username.");

       // ✅ Log user signup event
    logEvent(analytics, "sign_up", {
      method: "email_password",
      user_id: uid,
      role: "client",
    });
    
    setButtonLoading(false);
      navigate("/"); // Redirect to the homepage after successful registration
      window.location.reload();
    } catch (err: any) {
      setButtonLoading(false);
      alert(err.message || "An error occurred during account creation.");
      console.error("Error updating user profile:", err);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center">

      {/* Main Container */}
      <div className="relative w-full max-w-[1536px] min-h-screen md:h-[745px] flex justify-center items-center">
        {/* White Container */}
        <div className="w-screen max-w-[584px] h-screen md:h-auto bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-20 px-[50px] md:py-20 md:px-20 flex flex-col gap-6">
          {/* Back Button */}
          <div className="flex justify-start w-full pt-12 md:py-0">
            <IoChevronBackCircleOutline
              className="text-[#8C8C8C] w-[45px] h-[45px] cursor-pointer mb-3"
              onClick={() => navigate(-1)}
            />
          </div>

          {/* Header Text */}
          <div className="w-full flex justify-center">
              <p className="w-auto font-semibold text-[#191919] text-2xl tracking-[0] leading-[34px] text-left">
                Finally, create your account by choosing a username!
              </p>
          </div>

          {/* Additional Information Text */}
          <div className="w-full flex justify-center mt-[-18px]">
              <p className="font-normal text-[#545353] text-[17px] tracking-[0] leading-[20.4px]">
                This username will serve as your unique identifier on Creatify
                and will be visible to artists.
              </p>
          </div>

          {/* Username Field */}
          <div className="w-full flex justify-center">
            <div className="w-full flex flex-col items-start gap-2">
              <label className="font-semibold text-[#191919] text-[17px] tracking-[0] leading-[34px]">
                Choose a username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))} // Prevent spaces
                className="w-full h-[52px] border border-solid border-[#19191980] rounded-[30px] px-4"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <div className="w-full flex justify-center">
            <button
              onClick={handleCreateAccount}
              disabled={!username || buttonLoading}
              className={`w-full max-w-[442px] h-[52px] rounded-[30px] flex items-center justify-center ${
                username ? "bg-[#7db23a] cursor-pointer" : "bg-[#c4c4c4] cursor-not-allowed"
              }`}
            >
              <span className="font-semibold text-white text-2xl mt-1">
                {buttonLoading ? <ClipLoader size={20} color="white" /> : "Create Account"}
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignUpFinal;

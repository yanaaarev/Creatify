import { useState, useEffect } from "react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig"; // Import Firebase config
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

interface LocationState {
  email?: string;
}

export const SignUpFinal = (): JSX.Element => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState; // Explicitly type location.state
  const { email } = state || {};

  // Validate if the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Set the user's UID if authenticated
      } else {
        setError("You need to log in to complete registration.");
        navigate("/signup-options"); // Redirect to options if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!email) {
      setError("Missing email. Please start the sign-up process again.");
      navigate("/signup-options"); // Redirect back to options
    }
  }, [email, navigate]);

  const handleCreateAccount = async () => {
    setError("");

    if (!username) {
      setError("Please enter a username.");
      return;
    }

    try {
      if (!uid) {
        throw new Error("Authentication error. Please log in again.");
      }

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
    
      navigate("/"); // Redirect to the homepage after successful registration
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An error occurred during account creation.");
      console.error("Error updating user profile:", err);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/authp.png')" }}
      ></div>

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
              disabled={!username}
              className={`w-full max-w-[442px] h-[52px] rounded-[30px] flex items-center justify-center ${
                username ? "bg-[#7db23a] cursor-pointer" : "bg-[#c4c4c4] cursor-not-allowed"
              }`}
            >
              <span className="font-semibold text-white text-2xl mt-1">Create my account</span>
            </button>
          </div>

          {/* Terms and Privacy Policy */}
          <p className="font-normal text-[#19191980] text-[13px] tracking-[0] leading-[15.6px] text-left">
            By joining{" "}
            <span className="font-semibold">Creatify</span>, you agree to our{" "}
            <span className="font-semibold">Terms of Service</span> and acknowledge that you may
            occasionally receive emails from us. For details on how we protect and use your personal
            information, please review our{" "}
            <span className="font-semibold">Privacy Policy</span>.
          </p>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignUpFinal;

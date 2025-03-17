import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import AdminSidebar from "./AdminSidebar"; // Adjust path based on folder structure

const AdminPanel = (): JSX.Element => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generateRandomPassword());
  const [isActive, setIsActive] = useState<boolean>(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [, setError] = useState("");

  // 🔹 Function to Generate a Random Default Password
  function generateRandomPassword(): string {
    return Math.random().toString(36).slice(-10); // Generate a 10-character password
  }

  // 🔹 Ensure Admin Authentication
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/admin-login");
          return;
        }

        const idTokenResult = await user.getIdTokenResult(true);
        if (idTokenResult.claims.admin) {
          setIsAdmin(true);
        } else {
          setError("Access Denied: You are not an admin.");
          navigate("/admin-login");
        }
      } catch (error) {
        console.error("Admin Check Failed:", error);
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    const handleUnload = async () => {
      try {
        await auth.signOut(); // Sign out admin when tab is closed
      } catch (error) {
        console.error("Error during auto logout:", error);
      }
    };
  
    window.addEventListener("beforeunload", handleUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  

  // 🔹 Handle Artist Submission
  const handleSubmit = async () => {
    if (!fullName || !email) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("🟢 Attempting to add artist:", fullName, email);

      let artistUID = "";

      // 🔹 Step 1: Create Firebase Authentication User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      artistUID = userCredential.user.uid;
      console.log("✅ Firebase Auth User Created:", artistUID);

      // 🔹 Step 2: Store Artist Data in Firestore (Use UID as the Document ID)
      const artistRef = doc(db, "artists", artistUID);
      await setDoc(artistRef, {
        uid: artistUID, // Store UID for reference
        fullName,
        email,
        password,
        active: isActive,
        role: "artist",
      });

      console.log("✅ Artist added successfully to Firestore!");

      // Refresh Artists List
      setArtists([...artists, { id: artistUID, fullName, email, password, active: isActive }]);

      // Reset Form
      setFullName("");
      setEmail("");
      setPassword(generateRandomPassword());
      setIsActive(true);
      setError("");
    } catch (error) {
      console.error("❌ Failed to add artist:", error);
      setError("Failed to add artist. Try again.");
    }
  };


  // 🔹 Ensure Firebase Token is Up-to-Date
  auth.currentUser?.getIdToken(true).then((idToken) => {
    console.log("🔄 New Token Fetched:", idToken);
  });

  if (loading) {
    return <p className="flex items-center justify-center"></p>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-white text-lg mt-10">
        Unauthorized. Redirecting...
      </div>
    );
  }

  return (
    <div className="flex">
    {/* 🔹 Sidebar */}
    <AdminSidebar />

          {/* 🔹 Main Content */}
      <div className="flex w-full justify-center items-center min-h-screen bg-white">
        {/* 🔹 Add Artist Form (Centered & Bordered) */}
        <div className="border border-gray-300 text-[#191919] md:rounded-[30px] md:shadow-lg max-w-[700px] py-40 px-10 md:py-10 md:px-10 md:h-auto h-full w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center">Add an Artist</h2>

        {/* 🔹 Full Name Input */}
        <div className="mb-0">
              <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="w-full mb-4 p-3 border border-gray-400 rounded-[30px]" 
                  />
        </div>

        {/* 🔹 Email Input */}
        <div className="mb-0">
        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full mb-4 p-3 border border-gray-400 rounded-[30px]" 
                  />
        </div>

        {/* 🔹 Generated Password (Read-Only) */}
        <div className="mb-0">
              <label className="block text-gray-700 font-semibold mb-1">Generated Password</label>
                  <input 
                    type="text" 
                    placeholder="Generated Password" 
                    value={password} 
                    readOnly 
                    className="w-full mb-4 p-3 border border-gray-400 rounded-[30px] bg-gray-200" 
                  />
        </div>
          <button 
            onClick={handleSubmit} 
            className="w-full bg-[#7db23a] text-white py-3 rounded-[30px] font-semibold transition hover:bg-green-600">
            Add Artist
          </button>
        </div>
      </div>
    </div>
);
};

export default AdminPanel;

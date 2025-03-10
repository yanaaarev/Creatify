import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig";
import { collection, setDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import PaymentVerifier from "./PaymentVerifier"; // Adjust path based on folder structure

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

  // 🔹 Fetch Artists List in Real-Time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "artists"), (snapshot) => {
      setArtists(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
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

  // 🔹 Handle Artist Deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "artists", id));
      setArtists(artists.filter((artist) => artist.id !== id));
    } catch (error) {
      console.error("❌ Failed to delete artist:", error);
      setError("Failed to delete artist. Try again.");
    }
  };

  // 🔹 Handle Admin Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      setError("Logout failed. Try again.");
    }
  };

  // 🔹 Ensure Firebase Token is Up-to-Date
  auth.currentUser?.getIdToken(true).then((idToken) => {
    console.log("🔄 New Token Fetched:", idToken);
  });

  if (loading) {
    return <p className="text-white text-lg text-center mt-10">Loading...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-white text-lg mt-10">
        Unauthorized. Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#191919] relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/authp.png')" }}></div>

      <div className="relative z-10 w-full max-w-[700px] bg-white shadow-lg rounded-[30px] p-6">
        <h1 className="text-3xl font-semibold text-[#191919] text-center mb-6">Admin Panel - Add Artist</h1>

        {/* 🔹 Logout Button */}
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md">
          Logout
        </button>

        {/* 🔹 Form */}
        <div className="flex flex-col gap-4">
          <label className="text-[#191919] text-lg font-semibold">Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-[50px] border border-[#19191980] rounded-[30px] p-3" />

          <label className="text-[#191919] text-lg font-semibold">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[50px] border border-[#19191980] rounded-[30px] p-3" />

          <label className="text-[#191919] text-lg font-semibold">Generated Password</label>
          <input type="text" value={password} readOnly className="w-full h-[50px] border border-[#19191980] rounded-[30px] p-3 bg-gray-100" />

          <button onClick={handleSubmit} className="w-full h-[50px] bg-[#7db23a] text-white text-xl font-semibold rounded-[30px] mt-4">
            Add Artist
          </button>
        </div>
      </div>

      {/* 🔹 Artist List with Delete Button */}
      <div className="relative z-10 w-full max-w-[800px] mt-10 bg-white shadow-lg rounded-[30px] p-6">
        <h2 className="text-2xl font-semibold text-[#191919] text-center mb-4">Registered Artists</h2>

        {artists.map((artist) => (
          <div key={artist.id} className="flex justify-between items-center p-3 border-b">
            <span>{artist.fullName}</span>
            <button onClick={() => handleDelete(artist.id)} className="text-red-500">Delete</button>
          </div>
        ))}

      </div>
       {/* 🔹 Payment Verifier Section */}
<div className="relative z-10 w-full max-w-[800px] mt-10 bg-white shadow-lg rounded-[30px] p-6">
  <h2 className="text-2xl font-semibold text-[#191919] text-center mb-4">Payment Verification</h2>
  <PaymentVerifier />
</div>
    </div>
  );
};

export default AdminPanel;

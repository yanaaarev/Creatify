import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// 🔹 Define User Context Type
interface UserContextType {
  role: string | null;
  setRole: (role: string | null) => void;
  loading: boolean;
}

// 🔹 Create Context with Default Values
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole("client");
          setLoading(false);
          return;
        }

        const artistRef = doc(db, "artists", user.uid);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          setRole("artist");
          setLoading(false);
          return;
        }

        setRole(null);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Ensure `useUser` is Always Defined Before Export (Fixes HMR Issue)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

UserProvider;
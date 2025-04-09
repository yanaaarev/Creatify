import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebaseConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);
  const [, setIsAdmin] = useState(false);

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
          alert("Access Denied: You are not an admin.");
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
    const checkAuth = () => {
      if (!auth.currentUser) {
        console.log("User not authenticated");
        return;
      }
      console.log("User authenticated:", auth.currentUser.uid);
    };
    checkAuth();
  }, []);
  
    // 🔹 Ensure Firebase Token is Up-to-Date
    auth.currentUser?.getIdToken(true).then((idToken) => {
        console.log("🔄 New Token Fetched:", idToken);
      });

  return <>{children}</>; // Render children (the protected page content) if admin
};

export default ProtectedRoute;

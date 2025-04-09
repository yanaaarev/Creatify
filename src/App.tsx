import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useUser } from "./pages/context/UserContext"; // 🔴 Import UserContext
import ClientNavBar from "./pages/NavBar/ClientNavBar"; // Client Navbar
import ArtistNavBar from "./pages/NavBar/ArtistNavBar"; // Artist Navbar
import Footer from "./pages/Footer/Footer";
import { logEvent } from "firebase/analytics";
import { analytics } from "./config/firebaseConfig";
import { auth, db } from "./config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Analytics } from "@vercel/analytics/react";
import LoadingScreen from "./LoadingScreen";
import MaintenancePage from "./pages/Admin/MaintenancePage";

// Lazy load pages
const HomePage = lazy(() => import("./pages/Home/HomePage"));
const LoginOptions = lazy(() => import("./pages/Auth/LoginOptions"));
const ClientLoginOptions = lazy(
  () => import("./pages/Auth/ClientLoginOptions")
);
const ClientLogin = lazy(() => import("./pages/Auth/ClientLogin"));
const SignUpOptions = lazy(() => import("./pages/Auth/SignUpOptions"));
const SignUpEmail = lazy(() => import("./pages/Auth/SignUpEmail"));
const SignUpFinal = lazy(() => import("./pages/Auth/SignUpFinal"));
const About = lazy(() => import("./pages/Footer/About"));
const FAQs = lazy(() => import("./pages/Footer/FAQs"));
const TermsAndConditions = lazy(
  () => import("./pages/Footer/TermsAndConditions")
);
const CopyrightPolicy = lazy(() => import("./pages/Footer/CopyrightPolicy"));
const HowToBookAnArtist = lazy(
  () => import("./pages/Footer/HowToBookAnArtist")
);
const PrivacyPolicy = lazy(() => import("./pages/Footer/PrivacyPolicy"));
const UserDashboard = lazy(() => import("./pages/Client/UserDashboard"));
const ArtistDashboard = lazy(() => import("./pages/Artist/ArtistDashboard"));
const ArtistGallery = lazy(() => import("./pages/Client/ArtistGallery"));
const ArtistLogin = lazy(() => import("./pages/Auth/ArtistLogin"));
const AdminPanel = lazy(() => import("./pages/Admin/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const RegisteredArtist = lazy(() => import("./pages/Admin/RegisteredArtist"));
const PaymentVerifier = lazy(() => import("./pages/Admin/PaymentVerifier"));
const BookingHistory = lazy(() => import("./pages/Admin/BookingHistory"));
const ArtistNote = lazy(() => import("./pages/Booking/ArtistNote"));
const BookingCalendar = lazy(() => import("./pages/Booking/BookingCalendar"));
const BookingRequest = lazy(() => import("./pages/Booking/BookingRequest"));
const BookingConfirmation = lazy(
  () => import("./pages/Booking/BookingConfirmation")
);
const ClientBookingDetails = lazy(
  () => import("./pages/Client/ClientBookingDetails")
);
const RequestDashboard = lazy(() => import("./pages/Artist/RequestDashboard"));
const Messaging = lazy(() => import("./pages/Messaging/Messaging"));
const ArtistEdit = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure fresh import
  return import("./pages/Artist/ArtistEdit");
});

const AppContent = (): JSX.Element => {
  const location = useLocation();
  const { role, loading } = useUser(); // 🔴 Get user role and loading state from context
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("maintenanceBypass") === "true";
  });
  

  useEffect(() => {
    const checkMaintenanceAndAdmin = async () => {
      try {
        // 🔍 Get maintenance mode from Firestore
        const docSnap = await getDoc(doc(db, "config", "site"));
        if (docSnap.exists()) {
          setIsMaintenance(docSnap.data().maintenance === true);
        }

        // 🔐 Check if user is admin
        const user = auth.currentUser;
        if (!user) {
          setIsAdmin(false);
        } else {
          const idTokenResult = await user.getIdTokenResult(true);
          setIsAdmin(!!idTokenResult.claims.admin);
        }
      } catch (err) {
        console.error("Error checking maintenance or admin status:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkMaintenanceAndAdmin();
  }, []);

  useEffect(() => {
    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);
  
  useEffect(() => {
    // ✅ Log every page view
    logEvent(analytics, "page_view", {
      page_path: location.pathname,
    });
    console.log(`📌 Page View Logged: ${location.pathname}`);
  }, [location]);

  if (checkingAuth) return <LoadingScreen />;

  if (isMaintenance && !isAdmin && !isUnlocked) {
    return <MaintenancePage onUnlock={() => {
      sessionStorage.setItem("maintenanceBypass", "true");
      setIsUnlocked(true);
    }} />;
  }

  if (loading) return <LoadingScreen />; // ✅ Apply LoadingScreen while loading

  // ✅ Redirect Artists Away from Homepage
  if (role === "artist" && location.pathname === "/") {
    return <Navigate to="/artist-dashboard" replace />;
  }

  // Hide footer ONLY for artists on artist-dashboard
  const shouldHideFooter =
    [
      "/artist-dashboard",
      "/artist-edit",
      "/request-dashboard",
      "/artist-reviews",
      "/artist-messages",
      "/privacy-policy",
      "/copyright-policy",
      "/terms-and-conditions",
      "/faqs",
    ].includes(location.pathname) && role === "artist";

  // ✅ Hide Navbar & Footer for Booking Process
  const isBookingProcess = location.pathname.startsWith("/book-artist/");
  const isClientBooking = location.pathname.startsWith("/client-booking");
  const isArtistMessaging = location.pathname.startsWith("/artist-messages");
  const isClientMessaging = location.pathname.startsWith("/client-messages");
  const isMessaging = location.pathname.startsWith("/messages");

  // List of routes where NavBar and Footer should not be displayed
  const hiddenPaths = new Set([
    "/login-options",
    "/client-login",
    "/client-signin",
    "/signup-options",
    "/signup-email",
    "/signup-final",
    "/artist-login",
    "/user-dashboard",
    "/admin-panel",
    "/admin-login",
    "/admin-artists",
    "/admin-payments",
    "/admin-booking-history",
  ]);
  const hideNav =
    hiddenPaths.has(location.pathname) ||
    isBookingProcess ||
    isClientBooking ||
    isArtistMessaging ||
    isClientMessaging ||
    isMessaging;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally Render Navbar Based on User Role */}
      {!hideNav && (
        <>
          {role === "client" ? (
            <ClientNavBar />
          ) : role === "artist" ? (
            <ArtistNavBar />
          ) : (
            <ClientNavBar />
          )}
        </>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Suspense
          fallback={<LoadingScreen />} // ✅ Use LoadingScreen as fallback
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login-options" element={<LoginOptions />} />
            <Route path="/client-login" element={<ClientLoginOptions />} />
            <Route path="/client-signin" element={<ClientLogin />} />
            <Route path="/signup-options" element={<SignUpOptions />} />
            <Route path="/signup-email" element={<SignUpEmail />} />
            <Route path="/signup-final" element={<SignUpFinal />} />
            <Route path="/artist-login" element={<ArtistLogin />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/copyright-policy" element={<CopyrightPolicy />} />
            <Route
              path="/how-to-book-an-artist"
              element={<HowToBookAnArtist />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-booking-history" element={<BookingHistory />} />
            <Route path="/admin-artists" element={<RegisteredArtist />} />
            <Route path="/admin-payments" element={<PaymentVerifier />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/artist-dashboard"
              element={<ArtistDashboard mode="artist" />}
            />
            <Route
              path="/artist-profile/:artistId"
              element={<ArtistDashboard mode="client" />}
            />
            <Route path="/artist-edit" element={<ArtistEdit />} />
            <Route path="/artist-gallery" element={<ArtistGallery />} />
            <Route
              path="/book-artist/:artistId/artist-note"
              element={<ArtistNote />}
            />
            <Route
              path="/book-artist/:artistId/booking-calendar"
              element={<BookingCalendar />}
            />
            <Route
              path="/book-artist/:artistId/booking-request"
              element={<BookingRequest />}
            />
            <Route
              path="/book-artist/:artistId/booking-confirmation"
              element={<BookingConfirmation />}
            />
            <Route
              path="/client-booking/:bookingId"
              element={<ClientBookingDetails />}
            />
            <Route path="/request-dashboard" element={<RequestDashboard />} />
            <Route path="/client-messages" element={<Messaging />} />{" "}
            {/* ✅ FIX: Include Messaging as a Route */}
            <Route path="/artist-messages" element={<Messaging />} />{" "}
            {/* ✅ Artist Messages Page */}
            <Route path="/messages/:chatId" element={<Messaging />} />
          </Routes>
        </Suspense>
      </main>

      {/* Conditionally Render Footer */}
      {!hideNav && !shouldHideFooter && <Footer />}
    </div>
  );
};

const App = (): JSX.Element => (
  <Router>
    <AppContent />
    <Analytics />
  </Router>
);

export default App;

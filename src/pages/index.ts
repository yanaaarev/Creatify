
// Home
export { HomePage } from "./Home/HomePage";

// Auth
export { LoginOptions } from "./Auth/LoginOptions";
export { ClientLoginOptions } from "./Auth/ClientLoginOptions";
export { ClientLogin } from "./Auth/ClientLogin";
export { SignUpOptions } from "./Auth/SignUpOptions";
export { SignUpEmail } from "./Auth/SignUpEmail";
export { SignUpFinal } from "./Auth/SignUpFinal";
export { ArtistLogin } from "./Auth/ArtistLogin";

// Admin
import AdminPanel from "./Admin/AdminPanel";
export { AdminPanel };
import AdminLogin from "./Admin/AdminLogin";
export { AdminLogin };

// Client Pages
export { UserDashboard } from "./Client/UserDashboard";
import ArtistGallery from "./Client/ArtistGallery";
export  { ArtistGallery }

// Artist Pages
export { ArtistDashboard } from "./Artist/ArtistDashboard";
import ArtistEdit  from "./Artist/ArtistEdit";
export { ArtistEdit };
import ArtistNote  from "./Booking/ArtistNote";
export { ArtistNote };
import BookingCalendar from "./Booking/BookingCalendar";
export { BookingCalendar };
import BookingRequest from "./Booking/BookingRequest";
export { BookingRequest };
import BookingConfirmation from "./Booking/BookingConfirmation";
export { BookingConfirmation };
import ClientBookingDetails from "./Client/ClientBookingDetails";
export { ClientBookingDetails };
import RequestDashboard from "./Artist/RequestDashboard";
export { RequestDashboard };
import Messaging from "./Messaging/Messaging";
export { Messaging };

// Footer
export { About } from "./Footer/About";
export { FAQs } from "./Footer/FAQs";
export { TermsAndConditions } from "./Footer/TermsAndConditions";
export { CopyrightPolicy } from "./Footer/CopyrightPolicy";
export { HowToBookAnArtist } from "./Footer/HowToBookAnArtist";
export { PrivacyPolicy } from "./Footer/PrivacyPolicy";
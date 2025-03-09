import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AdminPanel,
  AdminLogin,
  HomePage,
  LoginOptions,
  ClientLoginOptions,
  ClientLogin,
  SignUpOptions,
  SignUpEmail,
  SignUpFinal,
  ArtistLogin,
  About,
  FAQs,
  TermsAndConditions,
  CopyrightPolicy,
  HowToBookAnArtist,
  PrivacyPolicy,
  UserDashboard,
  ArtistGallery,
  ArtistDashboard,
  ArtistEdit,
  ArtistNote,
  BookingCalendar,
  BookingRequest,
  BookingConfirmation,
  ClientBookingDetails,
  RequestDashboard,
  Messaging,
} from "./pages";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<LoginOptions />} />
        <Route path="/login/client" element={<ClientLoginOptions />} />
        <Route path="/login/client2" element={<ClientLogin />} />
        <Route path="/signup-options" element={<SignUpOptions />} />
        <Route path="/signup/email" element={<SignUpEmail />} />
        <Route path="/signup/final" element={<SignUpFinal />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/copyright-policy" element={<CopyrightPolicy />} />
        <Route path="/how-to-book-an-artist" element={<HowToBookAnArtist />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/artist-gallery" element={<ArtistGallery />} />
        <Route path="/artist-login" element={<ArtistLogin />} />
        <Route path="/artist-dashboard" element={<ArtistDashboard mode="artist" />} />
        <Route path="/artist-profile/:artistId" element={<ArtistDashboard mode="client" />} />
        <Route path="/artist-edit" element={<ArtistEdit />} />
        <Route path="/book-artist/:artistId/artist-note" element={<ArtistNote />} />
        <Route path="/book-artist/:artistId/booking-calendar" element={<BookingCalendar />} />
        <Route path="/book-artist/:artistId/booking-request" element={<BookingRequest />} />
        <Route path="/book-artist/:artistId/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/client-booking/:bookingId" element={<ClientBookingDetails />} />
        <Route path="/request-dashboard" element={<RequestDashboard />} />
        <Route path="/artist-messages" element={<Messaging />} />
        <Route path="/client-messages" element={<Messaging />} />
        {/* Add routes for the other pages */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

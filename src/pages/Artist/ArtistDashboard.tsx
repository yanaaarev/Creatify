import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc, query, where, getDocs, collection } from "firebase/firestore";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { AiFillFilePdf } from "react-icons/ai";
import { FaExternalLinkAlt } from "react-icons/fa";
import star1 from "/images/star.webp";
import ArtistPortfolio from "./ArtistPortfolio";
import ArtistCalendar from "./ArtistCalendar";
import ArtistFeedback from "./ArtistFeedback";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../config/firebaseConfig";

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";
const DEFAULT_BANNER_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1741784288/creatifybanner_m5gysx.png";

interface ArtistDashboardProps {
  mode: "artist" | "client";
  artistId?: string; // ✅ Add optional artistId prop
}

export const ArtistDashboard = ({ mode, artistId }: ArtistDashboardProps): JSX.Element => {
  const navigate = useNavigate();
  const { artistId: paramArtistId } = useParams(); // Used for client view
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);  
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
const [averageRating, setAverageRating] = useState(0);
const [totalReviews, setTotalReviews] = useState(0);
const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM Format


  const activeArtistId = mode === "artist" ? auth.currentUser?.uid : artistId || paramArtistId;

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!activeArtistId) {
        handleNavigate(mode === "artist" ? "/artist-login" : "/artist-gallery");
        return;
      }

      try {
        const artistRef = doc(db, "artists", activeArtistId);
        const artistSnap = await getDoc(artistRef);

        if (artistSnap.exists()) {
          setArtist(artistSnap.data());
        } else {
          console.error("Artist data not found.");
          handleNavigate(mode === "artist" ? "/artist-login" : "/artist-gallery");
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [activeArtistId, navigate, mode]);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!activeArtistId) return;
      setLoading(true);

      try {
        // 🔹 Fetch Unavailable Dates (Artist's set availability)
        const artistRef = doc(db, "artists", activeArtistId);
        const artistSnap = await getDoc(artistRef);

        let fetchedUnavailableDates: string[] = [];
        if (artistSnap.exists()) {
          const data = artistSnap.data();
          fetchedUnavailableDates = Array.isArray(data.unavailableDates) ? data.unavailableDates : [];
        }

        // 🔹 Fetch Active Booked Dates (Confirmed Bookings Only)
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("artistId", "==", activeArtistId),
          where("status", "==", "active") // ✅ Only fetch ACTIVE bookings
        );
        const bookingsSnap = await getDocs(bookingsQuery);

        let fetchedBookedDates: string[] = [];
        bookingsSnap.forEach((doc) => {
          const bookingData = doc.data();
          if (Array.isArray(bookingData.selectedDates)) {
            fetchedBookedDates.push(...bookingData.selectedDates);
          }
        });

        // ✅ Remove Duplicate Dates
        const uniqueBookedDates = Array.from(new Set(fetchedBookedDates));

        console.log("✅ Fetched Unavailable Dates:", fetchedUnavailableDates);
        console.log("✅ Fetched Active Booked Dates:", uniqueBookedDates);

        // ✅ Update State with Fetched Data
        setUnavailableDates(fetchedUnavailableDates);
        setBookedDates(uniqueBookedDates);
      } catch (error) {
        console.error("❌ Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [activeArtistId]);

  useEffect(() => {
    const fetchFeedbackAndRatings = async () => {
      if (!activeArtistId) return;
      try {
        // ✅ Query feedbacks for the artist
        const feedbackQuery = query(
          collection(db, "feedback"),
          where("artistId", "==", activeArtistId)
        );
        const feedbackSnap = await getDocs(feedbackQuery);
  
        let feedbackList: any[] = [];
        let totalRating = 0;
  
        feedbackSnap.forEach((doc) => {
          const feedbackData = doc.data();
          feedbackList.push({ id: doc.id, ...feedbackData });
          totalRating += feedbackData.rating;
        });
  
        // ✅ Calculate average rating
        const avgRating = feedbackList.length > 0 ? totalRating / feedbackList.length : 0;
  
        setFeedbacks(feedbackList);
        setAverageRating(avgRating);
        setTotalReviews(feedbackList.length);
  
        console.log("✅ Fetched Feedbacks:", feedbackList);
        console.log("✅ Average Rating:", avgRating);
      } catch (error) {
        console.error("❌ Error fetching feedbacks and ratings:", error);
      }
    };
  
    fetchFeedbackAndRatings();
  }, [activeArtistId]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading artist data...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-500">Error loading artist profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#191919] flex flex-col items-center w-full min-h-screen relative">
 <div className="absolute inset-0 max-w-full min-h-screen bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/authp.webp')" }}></div>
  {/* ✅ Banner Holder (Fixed Height Issue) */}
  <div className="w-full mt-[93px] h-[200px] md:w-[1250px] md:h-[290px] relative">
    <img
      className="w-full h-full object-cover"
      src={artist?.bannerImage || DEFAULT_BANNER_URL} // Temporary Default Banner
      alt="Artist Banner"
    />
     {/* Fake Save Target */}
     <a href="/images/bkitmsinave.webp" className="absolute inset-0 w-full h-full opacity-0"></a>

    {/* Overlay (Now Non-Blocking) */}
    <div className="absolute inset-0 img-overlay"></div>
  </div>

{/* Profile Section */}
<div className="relative flex flex-col items-center w-full max-w-[800px] p-4">
  {/* Profile Picture Holder */}
  <div className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] lg:w-[260px] lg:h-[260px] rounded-full overflow-hidden absolute left-1/2 transform -translate-x-1/2 -top-20 md:-top-28 lg:-top-32">
    {/* Profile Picture */}
    <img
      className="w-full h-full object-cover"
      src={artist?.profilePicture || DEFAULT_AVATAR_URL} // Temporary Default Avatar
      alt="Artist Profile"
    />
     
     {/* Fake Save Target */}
     <a href="/images/bkitmsinave.webp" className="absolute inset-0 w-full h-full rounded-full opacity-0"></a>

{/* Overlay (Now Non-Blocking) */}
<div className="absolute inset-0 img-overlay rounded-full"></div>
  </div>

  {/* Artist Info */}
  <div className="mt-20 md:mt-28 text-center">
    <h1 className="[font-family: 'Khula', Helvetica] text-white text-3xl font-bold mt-5">
      {artist?.fullName || "No name set"}
    </h1>
    <p className="[font-family: 'Khula', Helvetica] text-white font-semibold text-xl mt-2">
      {artist?.genre?.length > 0 ? artist.genre.join(", ") : "No genre yet"}
    </p>
    <p className="[font-family: 'Khula', Helvetica] text-white opacity-70 text-lg mt-1">
      {artist?.serviceType || "No service type set"}
    </p>
  </div>

  {/* Action Buttons & Ratings Section */}
  <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start px-4 xl:px-[180px] md:px-5 md:w-[1000px] xl:w-[1600px] mt-6 md:mt-[-235px]">
  
  <div className="relative w-full md:w-auto -top-[235px] right-7">
      {/* Menu Button for Mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex items-center gap-2 text-white text-xl mt-2 focus:outline-none"
      >
        <CiMenuKebab size={30} />
      </button>

      {/* Dropdown Menu for Mobile */}
{menuOpen && (
  <div className="absolute left-0 top-12 bg-[#191919] p-4 rounded-lg shadow-lg flex flex-col gap-3 z-50">
    <button
      className="flex items-center gap-2 text-[#7db23a] text-lg font-semibold"
      onClick={() => {
        setCurrentMonth(new Date().toISOString().slice(0, 7)); // ✅ Returns "YYYY-MM"
        setIsAvailabilityOpen(true);
      }}
    >
      <BsFillCalendarCheckFill className="w-5 h-5" />
      Check Availability
    </button>

    <button
      onClick={() => window.open(artist?.termsLink, "_blank")}
      className="flex items-center gap-2 text-[#ff7f00] text-lg font-semibold"
    >
      <AiFillFilePdf className="w-5 h-5" />
      Read Artist Terms
    </button>

    {artist.portfolioLink ? (
      <button
        onClick={() => window.open(artist.portfolioLink, "_blank")}
        className="flex items-center gap-2 text-[#3498db] text-lg font-semibold"
      >
        <FaExternalLinkAlt className="w-4 h-4" />
        View Portfolio
      </button>
    ) : (
      <button
        disabled
        className="flex items-center gap-2 text-gray-500 text-lg font-semibold cursor-not-allowed"
      >
        <FaExternalLinkAlt className="w-4 h-4" />
        No Portfolio Yet
      </button>
    )}
  </div>
)}

      {/* Normal Action Buttons for Desktop */}
      <div className="hidden md:flex flex-col gap-2 items-start mt-[230px] pl-[30px]">
        <button
          className="flex items-center gap-2 text-[#7db23a] text-xl font-semibold"
          onClick={() => {
            setCurrentMonth(new Date().toISOString().slice(0, 7)); // ✅ Returns "YYYY-MM"
            setIsAvailabilityOpen(true);
          }}
        >
          <BsFillCalendarCheckFill className="w-6 h-6" />
          Check Availability
        </button>

        <button
          onClick={() => window.open(artist?.termsLink, "_blank")}
          className="flex items-center gap-2 text-[#ff7f00] text-xl font-semibold"
        >
          <AiFillFilePdf className="w-6 h-6" />
          Read Artist Terms
        </button>

        {artist.portfolioLink ? (
          <button
            onClick={() => window.open(artist.portfolioLink, "_blank")}
            className="flex items-center gap-2 text-[#3498db] text-xl font-semibold"
          >
            <FaExternalLinkAlt className="w-5 h-5" />
            View Portfolio
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 text-gray-500 text-xl font-semibold cursor-not-allowed"
          >
            <FaExternalLinkAlt className="w-5 h-5" />
            No Portfolio Yet
          </button>
        )}
      </div>
    </div>

      {/* ✅ Availability Overlay (Read-Only Calendar) */}
      {isAvailabilityOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
            {/* ❌ Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-700 text-xl"
              onClick={() => setIsAvailabilityOpen(false)}
            >
              ✕
            </button>

            <br />

            {/* ✅ Show Loading State Before Data Fetch */}
            {loading ? (
              <p className="text-center text-gray-500">Loading calendar...</p>
            ) : (
              <ArtistCalendar
                unavailableDates={unavailableDates} // ✅ Pass Unavailable Dates
                bookedDates={bookedDates} // ✅ Pass Active Booked Dates
                setUnavailableDates={() => {}} // Read-only mode
                setChangesMade={() => {}} // Read-only mode
                isReadOnly={true} // ✅ Read-Only Mode
                currentMonth={new Date(`${currentMonth}-01`)}  // ✅ Pass current month to calendar
              />
            )}
          </div>
        </div>
      )}

  {/* Right Side: Ratings & Starting Rate (Stacked in Mobile) */}
  <div className="flex flex-col items-center md:items-end mt-[-45px] md:mt-0">
    {/* Reviews & Rating */}
    <div className="flex items-center gap-2">
      <p className="[font-family: 'Khula', Helvetica] text-white font-semiBold text-lg">
      {totalReviews} Reviews | {averageRating.toFixed(1)}
      </p>
      <img className="w-5 md:w-6 h-5 md:h-6" alt="Star" src={star1} />
    </div>

    {/* Starting Rate */}
    <p className="[font-family: 'Khula', Helvetica] text-white font-semiBold text-lg mt-1">
      Starting Rate: ₱{artist.startingRate || "Not Set"}
    </p>
  </div>
</div>
        
{/* ✅ Conditional Button Based on View Mode */}
<div className="w-full flex flex-col items-center md:mt-[-75px] mt-4 px-4">
  <button
    onClick={() => {
      const user = auth.currentUser; // ✅ Check if user is logged in
      // ✅ Log button click event
    logEvent(analytics, "button_clicked", {
      button_name: mode === "artist" ? "Edit Profile" : "Book This Artist",
      user_role: mode === "artist" ? "artist" : "client",
    });
      if (mode !== "artist" && !user) {
        handleNavigate("/client-login"); // 🔴 Redirect to login if not authenticated
      } else {
        handleNavigate(mode === "artist" ? "/artist-edit" : `/book-artist/${activeArtistId}/artist-note`);
      }
    }}
    className="bg-[#7db23a] text-white px-6 py-2 text-lg font-semibold rounded-full"
  >
    {mode === "artist" ? "Edit Profile" : "Book This Artist"}
  </button>

  {/* Artist Bio */}
  <p className="[font-family: 'Khula', Helvetica] text-white mt-4 md:mt-8 mb-4 md:mb-8 text-[15px] font-semibold text-left max-w-[800px]">
    {artist.bio || "No bio available yet."}
  </p>
</div>
          {/* Artist Portfolio */}
          <ArtistPortfolio portfolioImages={artist?.portfolioImages || []} />

          {/* Artist Feedback Section */}
          {activeArtistId && <ArtistFeedback artistId={activeArtistId} feedbacks={feedbacks} />}

        </div>
      </div>
  );
};

export default ArtistDashboard;

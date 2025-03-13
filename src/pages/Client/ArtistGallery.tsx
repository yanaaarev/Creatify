import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { VscSettings } from "react-icons/vsc";
import { BsFillCalendarCheckFill } from "react-icons/bs";
import star1 from "/images/star.png";
import authp from "/images/authp.png";
import sampleVideo from "/images/sample-video.mp4"; // Sample video path
import samplePortfolio from "/images/creatifyportfolio.png"; // Sample portfolio image path
import ArtistCalendar from "../Artist/ArtistCalendar"; // ✅ Import Calendar
import { limit } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

interface Artist {
  id: string;
  fullName: string;
  profilePicture: string;
  rating: number;
  genres: string[];
  portfolioImages: { url: string; type: string }[];
  active: boolean;
  unavailableDates: string[];
  bookedDates: string[]; // ✅ Add bookedDates to the type definition
}

const ArtistGallery = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [, setSelectedArtistDates] = useState<string[]>([]);
  const [, setAvailableGenres] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null); // ✅ Define type explicitly
  const [imageOrientations, setImageOrientations] = useState<Record<string, boolean>>({}); // ✅ Store orientations by artist ID
  const navigate = useNavigate();

  // ✅ Pagination State
const artistsPerPage = 12;
const [searchParams, setSearchParams] = useSearchParams();
const currentPage = Number(searchParams.get("page")) || 1;

// ✅ Calculate the index range for pagination
const indexOfLastArtist = currentPage * artistsPerPage;
const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
const currentArtists = filteredArtists.slice(indexOfFirstArtist, indexOfLastArtist);

const handlePageChange = (newPage: number) => {
  setSearchParams({ page: newPage.toString() }); // ✅ Updates URL
  window.location.reload(); // ✅ Ensures full reload only after URL update
};

  useEffect(() => {
      const fetchArtists = async () => {
          try {
              console.log("🚀 Fetching artists...");
  
              // ✅ Query Firestore to get only active artists
              const q = query(collection(db, "artists"), where("active", "==", true), limit(50));
              const snapshot = await getDocs(q);
  
              if (snapshot.empty) {
                  console.warn("⚠️ No active artists found!");
              }
  
              const artistData: Artist[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
                  const data = docSnap.data();
  
                  // 🔹 Fetch unavailable dates
                  const unavailableDates = Array.isArray(data.unavailableDates) ? data.unavailableDates : [];
  
                  // 🔹 Fetch booked dates for this artist
                  const bookingsQuery = query(
                      collection(db, "bookings"),
                      where("artistId", "==", docSnap.id),
                      where("status", "==", "active") // ✅ Only fetch ACTIVE bookings
                  );
                  const bookingsSnap = await getDocs(bookingsQuery);
  
                  let bookedDates: string[] = [];
                  bookingsSnap.forEach((doc) => {
                      const bookingData = doc.data();
                      if (Array.isArray(bookingData.selectedDates)) {
                          bookedDates.push(...bookingData.selectedDates);
                      }
                  });
  
                  // ✅ Remove duplicate booked dates
                  const uniqueBookedDates = Array.from(new Set(bookedDates));

                  // 🔹 Fetch artist's feedback to calculate average rating
                const feedbackQuery = query(collection(db, "feedback"), where("artistId", "==", docSnap.id));
                const feedbackSnap = await getDocs(feedbackQuery);

                let totalRating = 0;
                let feedbackCount = 0;

                feedbackSnap.forEach((doc) => {
                    const feedbackData = doc.data();
                    if (feedbackData.rating) {
                        totalRating += feedbackData.rating;
                        feedbackCount++;
                    }
                });

                // ✅ Compute average rating (with 1 decimal place)
                const avgRating = feedbackCount > 0 ? parseFloat((totalRating / feedbackCount).toFixed(1)) : 0;
  
                  return {
                      id: docSnap.id,
                      fullName: data.fullName || "Unknown Artist",
                      profilePicture: data.profilePicture || "",
                      rating: avgRating, // ✅ Store computed rating
                      genres: Array.isArray(data.genre) ? data.genre : [],
                      portfolioImages: Array.isArray(data.portfolioImages) ? data.portfolioImages : [],
                      active: data.active ?? false,
                      unavailableDates,
                      bookedDates: uniqueBookedDates, // ✅ Fix booked dates
                  };
              }));
  
              console.log("✅ Artists fetched:", artistData);
  
              // ✅ Set the state for artists
              setArtists(artistData);
              setFilteredArtists(artistData);
  
              // ✅ Extract unique genres from active artists
              const genresSet = new Set<string>();
              artistData.forEach((artist) => {
                  artist.genres.forEach((g) => genresSet.add(g));
              });
  
              setAvailableGenres(Array.from(genresSet));
          } catch (error) {
              console.error("❌ Error fetching artists:", error);
          } finally {
              setLoading(false);
          }
      };
  
      fetchArtists();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return; // No user logged in, allow access
      }

      try {
        const userRef = doc(db, "artists", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role === "artist") {
            alert("❌ Artists cannot access the Artist Gallery!");
            navigate("/artist-dashboard");
          }
        }
      } catch (error) {
        console.error("❌ Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  useEffect(() => {
    const detectImageOrientation = async () => {
      const orientations: Record<string, boolean> = {};
  
      await Promise.all(
        filteredArtists.map((artist) => {
          const featuredPortfolio =
            artist.portfolioImages.find((file) => file.type.startsWith("image")) || artist.portfolioImages[0];
  
          if (featuredPortfolio?.url && !featuredPortfolio.type.startsWith("video")) {
            return new Promise<void>((resolve) => {
              const img = new Image();
              img.src = featuredPortfolio.url;
              img.onload = () => {
                orientations[artist.id] = img.width > img.height; // ✅ Store orientation
                resolve();
              };
            });
          }
          return Promise.resolve();
        })
      );
  
      setImageOrientations(orientations); // ✅ Update state once all images are processed
    };
  
    detectImageOrientation();
  }, [filteredArtists]); // ✅ Runs when artists are updated

  // ✅ Toggle Dropdown Visibility
const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
};

// ✅ Filter Genres to Exclude "Admin Test Account"
const uniqueGenres = Array.from(
  new Set(artists.flatMap((artist) => artist.genres))
).filter((genre) => genre !== "Admin Test Account"); // ✅ Exclude "Admin Test Account"

// ✅ Handle Genre Selection (Excludes "Admin Test Account")
const handleFilterByGenre = (genre: string | null) => {
  if (genre === null) {
    setSelectedGenre(null);
    setFilteredArtists(
      artists.filter((artist) => !artist.genres.includes("Admin Test Account")) // ✅ Exclude "Admin Test Account"
    ); 
  } else {
    setSelectedGenre(genre);
    setFilteredArtists(
      artists.filter(
        (artist) =>
          artist.genres.includes(genre) && !artist.genres.includes("Admin Test Account") // ✅ Exclude "Admin Test Account"
      )
    );
  }
  setIsDropdownOpen(false); // Close dropdown after selection
};



// ✅ Open availability calendar overlay
const handleOpenCalendar = async (artist: Artist, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent navigation when clicking calendar button
  setLoading(true); // ✅ Set loading state when opening

  try {
    setSelectedArtist(artist); // ✅ Store selected artist
    setSelectedArtistDates(artist.unavailableDates); // ✅ Store unavailable dates
  } catch (error) {
    console.error("❌ Error setting artist for calendar:", error);
  } finally {
    setLoading(false); // ✅ Ensure loading stops
    setIsCalendarOpen(true); // ✅ Open overlay after setting data
  }
};

  return (
    <div 
  className="w-full min-h-screen bg-contain bg-center bg-no-repeat py-5 px-4 md:px-12 md:py-6"
  style={{ backgroundImage: `url(${authp})`, backgroundSize: "cover", backgroundAttachment: "fixed" }}
>
      {/* 🔹 Category Dropdown Button */}
      <div className="relative md:ml-[30px] md:mt-[110px] mt-[100px] mb-5 z-10 flex justify-center md:justify-start">
        <div
          className="flex items-center gap-2 px-12 py-3 bg-[#00000040] rounded-full shadow-lg text-white w-max cursor-pointer"
          onClick={toggleDropdown}
        >
          <VscSettings size={24} />
          <span className="font-normal text-sm">{selectedGenre ? selectedGenre : "Category"}</span>
        </div>

  {/* 🔹 Dropdown Menu (Only Shows When Open) */}
  {isDropdownOpen && (
    <div className="absolute left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 mt-[60px] bg-white rounded-lg shadow-lg w-48">
      <ul className="py-2 text-black">
        {/* ✅ Default Option to Show All Artists */}
        <li
          className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => handleFilterByGenre(null)}
        >
          Category (All)
        </li>
        <hr className="border-gray-300" />
         {/* ✅ List Available Genres (Excluding "Admin Test Account") */}
      {uniqueGenres.map((genre) => (
        <li
          key={genre}
          className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => handleFilterByGenre(genre)}
        >
          {genre}
        </li>
      ))}
    </ul>
  </div>
)}
</div>

    {/* 🔹 Artist Containers (Fixed Masonry Layout with Proper Heights) */}
    <div 
      className="w-full grid gap-4 sm:px-4 md:px-6 lg:px-8"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",  // ✅ Responsive Columns
        gridAutoFlow: "dense",  // ✅ Ensures proper placement
        gridAutoRows: "8px",   // ✅ FIX: Ensures portrait items don't stretch
      }}
    >
      {currentArtists.map((artist) => {
    const featuredPortfolio =
      artist.portfolioImages.find((file) => file.type.startsWith("image")) || artist.portfolioImages[0];

    const isVideo = featuredPortfolio?.type.startsWith("video");
    const isLandscape = imageOrientations[artist.id] ?? false; // ✅ Detect landscape orientation

    return (
      <div 
        key={artist.id}
        className="rounded-[30px] border border-white border-opacity-50 p-4 cursor-pointer relative bg-[#ffffff10]"
        style={{
          gridRow: isLandscape ? "span 16" : "span 24",  // ✅ FIX: Proper row-span control
          height: isLandscape ? "370px" : "560px", // ✅ FIX: Landscape 410px, Portrait 600px
        }}
        onClick={() => navigate(`/artist-profile/${artist.id}`)}
      >
    
      
        {/* 🔹 Featured Portfolio (Image or Video) */}
        <div className="relative rounded-[30px] overflow-hidden w-full"
          style={{
            height: isLandscape ? "200px" : "400px",  // ✅ FIX: Ensures correct height
          }}
        >
          {isVideo ? (
            <video
              src={featuredPortfolio?.url || sampleVideo}
              className="w-full h-full object-cover"
              muted loop
            />
          ) : (
            <img
              src={featuredPortfolio?.url || samplePortfolio}
              alt="Artist Work"
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center text-white text-4xl font-bold opacity-50">
            CREATIFY
          </div>
        </div>

        {/* 🔹 Artist Info */}
        <div className="text-center mt-6">
          <h3 className="text-white text-lg font-semibold">{artist.fullName}</h3>
          <p className="text-[#7db23a] text-sm font-bold truncate max-w-[280px] mx-auto mt-2 bottom-5">
            {artist.genres && artist.genres.length > 0 
              ? artist.genres.length > 1 
                ? `${artist.genres.slice(0, 2).join(", ")}...` 
                : artist.genres.join(", ") 
              : "No Genre Available"}
          </p>
        </div>

        {/* 🔹 Bottom Section */}
        <div className="flex justify-between items-center mt-4">
          {/* 📅 Check Availability */}
          <button
            className="text-[#7db23a]"
            onClick={(e) => handleOpenCalendar(artist, e)} // ✅ Pass full artist object
          >
            <BsFillCalendarCheckFill size={24} />
          </button>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-1">
            <span className="text-white text-lg mt-2">
              {typeof artist.rating === "number" && artist.rating > 0 ? artist.rating.toFixed(1) : "N/A"}
            </span>
            <img src={star1} alt="Star" className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  })}
</div>

{/* 🔹 Pagination Controls */}
<div className="flex justify-center items-center gap-4 mt-8">
  <button
    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
    className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm md:text-lg disabled:opacity-50"
    disabled={currentPage === 1}
  >
    ←
  </button>

  <span className="text-white text-sm md:text-lg font-semibold">
    Page {currentPage} of {Math.ceil(filteredArtists.length / artistsPerPage)}
  </span>

  <button
    onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredArtists.length / artistsPerPage)))}
    className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm md:text-lg disabled:opacity-50"
    disabled={indexOfLastArtist >= filteredArtists.length}
  >
  →
  </button>
</div>

      {/* ✅ Availability Overlay (Read-Only Calendar) */}
{isCalendarOpen && selectedArtist && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
            {/* ❌ Close Button */}
            <button className="absolute top-2 right-3 text-gray-700 text-xl"
                onClick={() => setIsCalendarOpen(false)}>
                ✕
            </button>
            <br />

            {/* ✅ Show Loading State Before Data Fetch */}
            {loading ? (
                <p className="text-center text-gray-500">Loading calendar...</p>
            ) : (
                <ArtistCalendar
                    unavailableDates={selectedArtist?.unavailableDates ?? []} // ✅ Ensure fallback value
                    bookedDates={selectedArtist?.bookedDates ?? []} // ✅ Ensure fallback value
                    setUnavailableDates={() => {}} // Read-only mode
                    setChangesMade={() => {}} // Read-only mode
                    isReadOnly={true} // ✅ Pass Read-Only Flag
                />
            )}
            {/* 📌 Date Indicators */}
        <div className="[font-family:'Khula',Helvetica] text-xs text-center space-x-2">
          <span className="text-[#191919] text-opacity-50 text-lg">●</span> Unavailable
          <span className="text-red-500 text-lg">●</span> Booked
        </div>
        </div>
    </div>
)}
    </div>
  );
};

export default ArtistGallery;

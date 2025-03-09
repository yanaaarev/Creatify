import { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import ArtistCalendar from "./ArtistCalendar"; // Import calendar component

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1740737790/samplepfp_gg1dmq.png";
const DEFAULT_BANNER_URL = "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1741468141/samplebannerfinal_polxhq.jpg";

const ArtistEdit = (): JSX.Element => {
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changesMade, setChangesMade] = useState(false);
   // 🔹 Form Fields
   const [bio, setBio] = useState("");
   const [genre, setGenre] = useState("");
   const [serviceType, setServiceType] = useState("Digital Only");
   const [startingRate, setStartingRate] = useState("");
   const [termsLink, setTermsLink] = useState("");
   const [artistGenres, setArtistGenres] = useState<string[]>([]);
   const [portfolioLink, setPortfolioLink] = useState(artist?.portfolioLink || "");
   const [bookingNotice, setBookingNotice] = useState(artist?.bookingNotice || "");
   const [minBookingDays, setMinBookingDays] = useState(artist?.minBookingDays || "");
   const [maxBookingDays, setMaxBookingDays] = useState(artist?.maxBookingDays || "");
   const [noteToClient, setNoteToClient] = useState(artist?.noteToClient || "");
   const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
   const [bookedDates, setBookedDates] = useState<string[]>([]);
   const [portfolioFiles, setPortfolioFiles] = useState<{ url: string; type: string }[]>([]);
   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const MAX_FILES = 5;
   const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
   const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

   useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/artist-login");
      return;
    }
  
    fetchAvailabilityData(user.uid, setArtist, setUnavailableDates, setBookedDates, setLoading);
  }, [navigate]);
  
  
  const fetchAvailabilityData = async (
    artistId: string,
    setArtist: any, // ✅ Added to set artist data
    setUnavailableDates: any,
    setBookedDates: any,
    setLoading: any
  ) => {
    if (!artistId) return;
    setLoading(true);
  
    try {
      // 🔹 Fetch Artist Data (Profile & Unavailable Dates)
      const artistRef = doc(db, "artists", artistId);
      const artistSnap = await getDoc(artistRef);
  
      let fetchedArtistData: any = null;
      let fetchedUnavailableDates: string[] = [];
  
      if (artistSnap.exists()) {
        fetchedArtistData = artistSnap.data();
        fetchedUnavailableDates = Array.isArray(fetchedArtistData.unavailableDates) ? fetchedArtistData.unavailableDates : [];
      }
  
      // 🔹 Fetch Active Booked Dates (Confirmed Bookings Only)
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("artistId", "==", artistId),
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
  
      console.log("✅ Fetched Artist Data:", fetchedArtistData);
      console.log("✅ Fetched Unavailable Dates:", fetchedUnavailableDates);
      console.log("✅ Fetched Active Booked Dates:", uniqueBookedDates);
  
      // ✅ Update State with Fetched Data
      if (fetchedArtistData) setArtist(fetchedArtistData); // ✅ Ensure artist data is set
      setUnavailableDates(fetchedUnavailableDates);
      setBookedDates(uniqueBookedDates);
    } catch (error) {
      console.error("❌ Error fetching availability data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  // ✅ Separate `useEffect` for updating state based on fetched artist data
  useEffect(() => {
    if (!artist) return;
  
    setBio(artist.bio || "");
    setArtistGenres(artist.genre || []);
    setServiceType(artist.serviceType || "");
    setStartingRate(artist.startingRate || "");
    setTermsLink(artist.termsLink || "");
    setPortfolioLink(artist.portfolioLink || "");
    setPortfolioFiles(artist.portfolioImages || []);
    setBookingNotice(artist.bookingNotice || ""); // ✅ Now inside a separate useEffect
    setMinBookingDays(artist.minBookingDays || "");
    setMaxBookingDays(artist.maxBookingDays || "");
    setNoteToClient(artist.noteToClient || "");
     // ✅ Prevent empty state update
  if (bookedDates.length > 0 || artist.unavailableDates?.length > 0) {
    setUnavailableDates([
      ...new Set([...(artist.unavailableDates || []), ...bookedDates]) // 🔥 Remove duplicates
    ]);
  }
}, [artist, bookedDates]); // ✅ Re-run effect when `bookedDates` change

  // ✅ Upload Image to Cloudinary (Profile or Banner)
const handleUpload = async (file: File, type: "pfp" | "banner") => {
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    // ✅ Upload new image
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", type === "pfp" ? "artist_pfp" : "artist_banner");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/ddjnlhfnu/image/upload`,
      formData
    );

    const imageUrl = response.data.secure_url;

    // ✅ Update Firestore with new image URL
    const artistRef = doc(db, "artists", user.uid);
    await updateDoc(artistRef, { [type === "pfp" ? "profilePicture" : "bannerImage"]: imageUrl });

    // ✅ Update UI
    setArtist((prev: any) => ({
      ...prev,
      [type === "pfp" ? "profilePicture" : "bannerImage"]: imageUrl,
    }));

    setChangesMade(true);
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};

  // ✅ Remove Image from Placeholder and Reset to Default
const handleRemoveImage = async (type: "pfp" | "banner") => {
    try {
      // ✅ Reset Firestore field to empty ("" means no image)
      const user = auth.currentUser;
      if (user) {
        const artistRef = doc(db, "artists", user.uid);
        await updateDoc(artistRef, { 
          [type === "pfp" ? "profilePicture" : "bannerImage"]: "" 
        });
  
        // ✅ Update UI to show default image
        setArtist((prev: any) => ({
          ...prev,
          [type === "pfp" ? "profilePicture" : "bannerImage"]: "",
        }));
      }
  
      console.log(`✅ ${type} image removed, placeholder reset to default.`);
    } catch (error) {
      console.error("❌ Error resetting image:", error);
    }
  };

// 🔹 Predefined list of common artist genres
const genreSuggestions = [
  "Graphic Artist",
  "Photographer",
  "Traditional Artist",
  "Illustrator",
  "Concept Artist",
  "Fine Artist",
  "3D Modeler",
  "Digital Painter",
  "Comic Artist",
  "Tattoo Artist",
  "Calligrapher",
  "Sculptor",
  "Motion Graphics Designer",
  "Street Artist",
  "Graffiti Artist",
  "Fashion Designer",
  "Storyboard Artist",
];

// 🔹 Handle Adding Genre (with Suggestion Selection)
const handleAddGenre = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter" && genre.trim() !== "") {
    e.preventDefault();

    if (artistGenres.length < 3 && !artistGenres.includes(genre.trim())) {
      setArtistGenres([...artistGenres, genre.trim()]);
      setGenre(""); // Clear input
      setFilteredSuggestions([]); // Clear suggestions
      setChangesMade(true);
    }
  }
};

// 🔹 Handle Removing Genre
const handleRemoveGenre = (index: number) => {
  setArtistGenres(artistGenres.filter((_, i) => i !== index));
  setChangesMade(true);
};

// 🔹 State for filtered suggestions
const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

// 🔹 Handle Genre Input Change (Filters Suggestions)
const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value;
  setGenre(input);

  if (input.trim() === "") {
    setFilteredSuggestions([]);
  } else {
    // Filter matching suggestions
    const filtered = genreSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }
};

// 🔹 Handle Suggestion Click (Sets the Genre)
const handleSuggestionClick = (suggestion: string) => {
  if (artistGenres.length < 3 && !artistGenres.includes(suggestion)) {
    setArtistGenres([...artistGenres, suggestion]);
    setGenre(""); // Clear input
    setFilteredSuggestions([]); // Clear suggestions
    setChangesMade(true);
  }
};


const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadingIndex, setUploadingIndex] = useState<number | null>(null); // Track placeholder index

const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;
  processFiles(Array.from(files));
};

const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  processFiles(Array.from(files));
};

const processFiles = async (files: File[]) => {
  if (isUploading || portfolioFiles.length >= MAX_FILES) return;

  setIsUploading(true);

  const uploadedFiles = [...portfolioFiles];

  for (const file of files) {
    if (uploadedFiles.length >= MAX_FILES) break;

    const isImage = file.type.startsWith("image");
    const isVideo = file.type.startsWith("video");

    if (!isImage && !isVideo) {
      alert("Only image and video files are allowed.");
      continue;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      alert("Image file size must be less than 5MB.");
      continue;
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      alert("Video file size must be less than 25MB.");
      continue;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", isVideo ? "artist_videos" : "artist_portfolio");

    try {
      setUploadingIndex(uploadedFiles.length);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/ddjnlhfnu/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) { // ✅ Ensure total exists before using it
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        }
      );

      uploadedFiles.push({ url: response.data.secure_url, type: file.type });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  }

  setPortfolioFiles(uploadedFiles);
  setChangesMade(true);
  setIsUploading(false);
};

const handleRemovePortfolioFile = (index: number) => {
  const updatedFiles = portfolioFiles.filter((_, i) => i !== index);
  setPortfolioFiles(updatedFiles);
  setChangesMade(true);
};


const handleSaveChanges = async () => {
  if (!changesMade) return;

  try {
    const user = auth.currentUser;
    if (user) {
      const artistRef = doc(db, "artists", user.uid);
      await updateDoc(artistRef, {
        portfolioImages: portfolioFiles.map(file => ({
          url: file.url, 
          type: file.type // ✅ Ensuring both URL & type are saved
        })), 
        profilePicture: artist?.profilePicture || "",
        bannerImage: artist?.bannerImage || "",
        bio: bio || "", // ✅ Save updated bio
        genre: artistGenres || [], // ✅ Save updated genres
        serviceType: serviceType || "", // ✅ Save updated service type
        startingRate: startingRate || "", // ✅ Save updated rate
        termsLink: termsLink || "", // ✅ Save updated terms link
        portfolioLink: portfolioLink || "", // ✅ Save updated portfolio link
        bookingNotice: bookingNotice || "", // ✅ Save updated booking notice
        minBookingDays: minBookingDays || "", // ✅ Save updated min booking days
        maxBookingDays: maxBookingDays || "", // ✅ Save updated max booking days
        noteToClient: noteToClient || "", // ✅ Save updated note to client
        unavailableDates: unavailableDates || [], // ✅ Save updated unavailable dates
      });

      console.log("✅ Changes saved successfully!");
      setChangesMade(false);

      // ✅ Redirect to Artist Dashboard
      navigate("/artist-dashboard");
    }
  } catch (error) {
    console.error("❌ Error saving changes:", error);
  }
};


  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="bg-[#191919] flex flex-col items-center w-full h-full overflow-y-auto relative">
      {/* ✅ Fixed Background Image */}
  <div className="absolute inset-0 h-full w-full">
    <div 
      className="absolute inset-0 bg-center bg-no-repeat h-full w-full bg-fixed md:bg-contain"
      style={{ 
        backgroundImage: "url('/src/assets/authp.png')",
        backgroundSize: "cover", // ✅ Default: Fills screen
        backgroundPosition: "top center",
      }} 
    ></div>
     {/* ✅ Gradient Overlay to Blend Image with Background */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1E1E1E]"></div>
  </div>

      {/* White Container */}
      <div className="relative w-[90%] max-w-[750px] bg-white rounded-[30px] p-10 mt-[160px] shadow-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 px-4 py-10 text-[#8C8C8C] text-4xl z-10"
        >
          <IoChevronBackCircleOutline />
        </button>
      {/* Profile Image Section */}
<div className="relative flex flex-col items-center border-b border-gray-300 pb-6">
  <div className="flex justify-between w-full mt-20">
    <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
      Profile Image
    </h2>
    <label className="cursor-pointer">
      <FaPencilAlt className="text-gray-500" />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && handleUpload(e.target.files[0], "pfp")
        }
      />
    </label>
  </div>

  {/* Profile Picture */}
  <div className="relative mt-4">
    <img
      src={artist?.profilePicture || DEFAULT_AVATAR_URL}
      alt="Profile"
      className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full object-cover"
    />
    {artist?.profilePicture && (
      <button
        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
        onClick={() => handleRemoveImage("pfp")}
      >
        <FaTrash size={14} />
      </button>
    )}
  </div>
</div>

{/* Banner Image Section */}
<div className="relative flex flex-col items-center border-b border-gray-300 py-6">
  <div className="flex justify-between w-full">
    <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
      Banner Image
    </h2>
    <label className="cursor-pointer">
      <FaPencilAlt className="text-gray-500" />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && handleUpload(e.target.files[0], "banner")
        }
      />
    </label>
  </div>

  {/* Banner Image */}
  <div className="relative mt-4 w-full">
    <img
      src={artist?.bannerImage || DEFAULT_BANNER_URL}
      alt="Banner"
      className="w-full h-[150px] md:h-[200px] object-cover rounded-lg"
    />
    {artist?.bannerImage && (
      <button
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
        onClick={() => handleRemoveImage("banner")}
      >
        <FaTrash size={14} />
      </button>
    )}
  </div>
</div>

        {/* Update Bio */}
<div className="border-b border-gray-300 py-6">
  <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">Update Bio</h2>
  <textarea
    className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
    rows={3}
    value={bio}
    onChange={(e) => {
      if (e.target.value.length <= 250) { // ✅ Limit to 250 characters
        setBio(e.target.value);
        setChangesMade(true);
      }
    }}
    placeholder="Describe yourself in a few words..."
  />
  <p className="text-sm text-gray-500 mt-1">{bio.length}/250</p> {/* ✅ Show character count */}
</div>

        {/* Artist Genre */}
<div className="border-b border-gray-300 py-6 relative">
  <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">Artist Genre</h2>
  
  {/* Display Selected Genres as Tags */}
  <div className="flex flex-wrap gap-2 mt-2">
    {artistGenres.map((genre, index) => (
      <div 
        key={index} 
        className="flex items-center bg-[#7db23a] text-white px-3 py-1 rounded-full text-sm"
      >
        {genre}
        <button 
          onClick={() => handleRemoveGenre(index)} 
          className="ml-2 text-white font-bold"
        >
          ✕
        </button>
      </div>
    ))}
  </div>

  {/* Genre Input Field with Suggestions */}
  <div className="relative">
    <input
      type="text"
      className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
      value={genre}
      onChange={handleGenreChange} // Handle Input Change
      onKeyDown={handleAddGenre} // Handle Enter Key Press
      placeholder="Ex. Graphic Artist, Photographer, Traditional Artist, etc..."
      disabled={artistGenres.length >= 3} // Disable input if max 3 reached
    />

    {/* Genre Suggestions Dropdown */}
    {filteredSuggestions.length > 0 && (
      <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
        {filteredSuggestions.map((suggestion, index) => (
          <li 
            key={index}
            className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-sm"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

        {/* Service Type */}
<div className="border-b border-gray-300 py-6">
  <h2 className="text-[#191919] text-lg font-semibold">Service Type</h2>
  <div className="relative">
    <select
      className="w-full border border-gray-300 rounded-[30px] p-5 pr-10 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100 appearance-none"
      value={serviceType}
      onChange={(e) => { setServiceType(e.target.value); setChangesMade(true); }}
    >
      <option value="" disabled hidden>-- Select Service Type --</option>
      <option value="Digital-Only Services">Digital Only</option>
      <option value="Remote-Only Services">On-site Only</option>
      <option value="Both Services">Both On-site & Digital</option>
    </select>

    {/* Custom Arrow */}
    <div className="absolute inset-y-0 mt-6 right-4 flex items-center text-2xl pointer-events-none">
      🢓
    </div>
  </div>
</div>
        {/* Starting Rate */}
        <div className="border-b border-gray-300 py-6">
          <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">Set Starting Rate</h2>
          <input
            type="string"
            className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
            value={startingRate}
            onChange={(e) => { setStartingRate(e.target.value); setChangesMade(true); }}
            placeholder="Specify the starting rate for your services..."
          />
        </div>

        {/* Terms & Services Link */}
<div className="border-b border-gray-300 py-6">
  <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">Terms & Services Link</h2>
  <input
    type="text"
  className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
    value={termsLink}
    onChange={(e) => {
      setTermsLink(e.target.value);
      setChangesMade(true);
    }}
    placeholder="Provide a Google Drive link to your terms and services..."
  />
</div>

{/* Portfolio Link */}
<div className="border-b border-gray-300 py-6">
  <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
    Portfolio Link
  </h2>
  <input
    type="text"
    className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
    value={portfolioLink}
    onChange={(e) => {
      setPortfolioLink(e.target.value);
      setChangesMade(true);
    }}
    placeholder="Provide a portfolio link (e.g., Google Drive, Behance, etc.)"
  />
</div>

{/* Upload Portfolio Section */}
<div className="border-b border-gray-300 py-6">
  {/* Title with Image Counter */}
  <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
    Upload Portfolio <span className="text-[#191919] text-opacity-[45%]">({portfolioFiles.length}/5)</span>
  </h2>

  {/* Drag & Drop or Browse Button */}
  <div
    className="w-full h-auto [font-family:'Khula',Helvetica] text-xs font-semibold text-[#FFFFFF] bg-[#191919] bg-opacity-[30%] border border-gray-300 rounded-[30px] p-3 mt-2 text-center cursor-pointer"
    onClick={() => fileInputRef.current?.click()}
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleDrop}
  >
    Drag & drop a file or browse
  </div>

  {/* Hidden File Input */}
  <input
    type="file"
    accept="image/*,video/*"
    ref={fileInputRef}
    className="hidden"
    onChange={handlePortfolioUpload}
    multiple
    disabled={portfolioFiles.length >= 5 || isUploading} // Disable if max reached or uploading
  />

  {/* Portfolio Placeholders */}
  <div className="flex gap-2 flex-wrap mt-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div 
        key={index} 
        className="relative w-[104px] h-[120px] md:w-[134px] md:h-[150px] border border-gray-300 flex items-center justify-center bg-gray-100"
      >
        {/* ✅ Show loading bar if uploading */}
        {isUploading && uploadingIndex === index ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="w-[80%] bg-gray-300 rounded-full h-2">
              <div
                className="bg-[#7db23a] h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }} // ✅ Dynamic Progress
              />
            </div>
          </div>
        ) : (
          portfolioFiles[index] ? (
            <>
              {portfolioFiles[index]?.type?.startsWith("video") ? (
                <video
                  src={portfolioFiles[index]?.url}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
              ) : (
                <img
                  src={portfolioFiles[index]?.url}
                  alt="Portfolio"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              {/* Remove Button */}
              <button
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-[20px] h-[20px] p-1 rounded-[30px]"
                onClick={() => handleRemovePortfolioFile(index)}
              >
                ✕
              </button>
            </>
          ) : (
            <span className="text-gray-500 text-3xl">+</span>
          )
        )}
      </div>
    ))}
  </div>
</div>

        {/* Booking Notice Period */}
        <div className="border-b border-gray-300 py-6">
          <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
            Booking Notice Period
          </h2>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
            value={bookingNotice}
            onChange={(e) => {
              if (e.target.value.length <= 2) {
              setBookingNotice(e.target.value);
              setChangesMade(true);
              }
            }}
            placeholder="Enter how much notice is needed before setting the commission date"
          />
          <p className="text-sm text-gray-500 mt-1">{bookingNotice.length}/2</p> {/* ✅ Show character count */}
        </div>

        {/* Minimum Days for Booking */}
        <div className="border-b border-gray-300 py-6">
          <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
            Minimum Days for Booking
          </h2>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
            value={minBookingDays}
            onChange={(e) => {
              if (e.target.value.length <= 2) {
              setMinBookingDays(e.target.value);
              setChangesMade(true);
              }
            }}
            placeholder="Enter the minimum number of days required for a client to book your services."
          />
          <p className="text-sm text-gray-500 mt-1">{minBookingDays.length}/2</p> {/* ✅ Show character count */}
        </div>

        {/* Maximum Days for Booking */}
        <div className="border-b border-gray-300 py-6">
          <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
            Maximum Days for Booking
          </h2>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
            value={maxBookingDays}
            onChange={(e) => {
              if (e.target.value.length <= 2) {
              setMaxBookingDays(e.target.value);
              setChangesMade(true);
              }
            }}
            placeholder="Enter the maximum number of days a client can book your services."
          />
          <p className="text-sm text-gray-500 mt-1">{maxBookingDays.length}/2</p> {/* ✅ Show character count */}
        </div>

        {/* Note to Client */}
        <div className="py-6">
          <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-lg font-semibold">
            Note to Client
          </h2>
          <textarea
            className="w-full border border-gray-300 rounded-[30px] p-5 mt-2 placeholder-gray-500 [font-family:'Khula',Helvetica] text-sm font-light placeholder-opacity-100"
            value={noteToClient}
            rows={5}
            onChange={(e) => {
              if (e.target.value.length <= 750) { // ✅ Limit to 750 characters
                setNoteToClient(e.target.value);
                setChangesMade(true);
              }
            }}
            placeholder="Place your notes that will show before a client proceeds to book you."
          />
          <p className="text-sm text-gray-500 mt-1">{noteToClient.length}/750</p> {/* ✅ Show character count */}
        </div>

        <div className="py-6">
          {/* ✅ Header with "Select Unavailable Dates" & "Unavailable" Badge */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="[font-family:'Khula',Helvetica] text-[#191919] text-[15px] font-light">
              Select Unavailable Dates:
            </h2>
            <span className="[font-family:'Khula',Helvetica] bg-[#191919] bg-opacity-30 text-white text-sm font-semibold px-10 py-2 rounded-full">
              Unavailable
            </span>
          </div>

          <ArtistCalendar
          unavailableDates={unavailableDates} // ✅ Pass Unavailable Dates
          bookedDates={bookedDates} // ✅ Pass Active Booked Dates
          setUnavailableDates={setUnavailableDates}
          setChangesMade={setChangesMade}
        />

            {/* ✅ Save Changes Button (Gray when disabled) */}
      <button
        onClick={handleSaveChanges}
        className={`mt-6 text-white px-6 py-2 rounded-[30px] w-full transition 
          ${changesMade ? "bg-[#7db23a] hover:bg-[#689e2f]" : "bg-gray-400 cursor-not-allowed"}`}
        disabled={!changesMade}
      >
        Save Changes
      </button>

      </div>
    </div>
  </div>
  );
};

export default ArtistEdit;

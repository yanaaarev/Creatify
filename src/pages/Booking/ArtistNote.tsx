import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { db } from "../../config/firebaseConfig";
import authp from "/images/authp.webp";

const ArtistNote = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [artistNote, setArtistNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistNote = async () => {
      if (!artistId) return;
      try {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          setArtistNote(artistSnap.data().noteToClient || "No artist note available.");
        } else {
          setArtistNote("Artist note not found.");
        }
      } catch (error) {
        console.error("Error fetching artist note:", error);
        setArtistNote("Error loading artist note.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistNote();
  }, [artistId]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${authp})` }}
    >
      {/* ✅ White Rounded Container */}
      <div className="bg-white rounded-none md:rounded-3xl md:shadow-lg px-[30px] md:px-20 md:py-20 py-20 w-screen h-screen md:h-auto md:max-w-5xl md:mt-2">
        {/* 🔙 Back Button */}
        <button
          className="flex items-center text-[#8C8C8C] hover:text-gray-900 mt-0 mb-6"
          onClick={() => {
            sessionStorage.removeItem("selectedDates"); // ✅ Clear stored dates
            navigate(-1); // ✅ Go back to the previous page
          }}
        >
          <IoChevronBackCircleOutline size={40} className="" />
        </button>

        {/* 📌 Artist Note */}
        <h2 className="[font-family:'Khula',Helvetica] text-lg font-semibold text-[#191919]">Artist Note:</h2>

        {/* 📝 Artist Note Content */}
        <div className="pt-3 whitespace-pre-line min-h-[50px] max-h-[600px] overflow-y-hidden">
          {loading ? "Loading..." : artistNote}
        </div>

        {/* 🔜 Next Button */}
        <div className="flex justify-center mt-6">
          <button
            className="w-full max-w-[900px] bg-[#7db23a] text-white py-2 px-1 rounded-full text-lg font-semibold"
            onClick={() => navigate(`/book-artist/${artistId}/booking-calendar`)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistNote;

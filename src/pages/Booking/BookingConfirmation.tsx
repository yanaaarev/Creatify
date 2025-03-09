import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import authp from "../../assets/authp.png";

const BookingConfirmation = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artistName, setArtistName] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistName = async () => {
      if (!artistId) return;
      try {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          setArtistName(artistSnap.data().fullName || "the artist");
        }
      } catch (error) {
        console.error("❌ Error fetching artist name:", error);
      }
    };

    fetchArtistName();
  }, [artistId]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${authp})` }}>
      <div className="bg-white py-[300px] px-[30px] md:px-12 md:py-16 md:rounded-[30px] shadow-lg w-full md:h-auto h-screen md:max-w-3xl text-center">
        {/* ✅ Confirmation Message */}
        <p className="[font-family:'Khula',Helvetica] text-sm font-medium md:pt-0 pt-5 mt-5 text-gray-700">
        Thank you for booking with Creatify! We have received your request to book <b>{artistName}</b>. You will receive a notification and a message from the artist once they review your booking. Please note that you have <b>24 hours</b> to cancel this booking without any obligation. If you have any questions, feel free to contact us at <b>support.creatify@gmail.com</b>.
        </p>

        {/* ✅ Back to Homepage Button */}
        <button
          className="bg-[#7db23a] [font-family:'Khula',Helvetica] text-white px-6 py-2 rounded-full w-full max-w-[650px] mt-2 mb-5"
          onClick={() => handleNavigate("/")}
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;

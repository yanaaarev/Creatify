import { useParams } from "react-router-dom";
import ArtistDashboard from "./ArtistDashboard";

const ArtistProfile = () => {
  const { artistId } = useParams();

  console.log("Artist ID:", artistId); // ✅ Debug: Check if artistId exists

  if (!artistId) {
    return <p className="text-center text-red-500 mt-10">Invalid Artist Profile</p>;
  }

  return <ArtistDashboard mode="client" artistId={artistId} />;
};

export default ArtistProfile;

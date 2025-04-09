import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { MdDelete } from "react-icons/md";
import AdminSidebar from "./AdminSidebar";

const ITEMS_PER_PAGE = 6; // 🔹 Show only 10 artists per page

const RegisteredArtists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

useEffect(() => {
  const handleUnload = async () => {
    try {
      await auth.signOut(); // Sign out admin when tab is closed
    } catch (error) {
      console.error("Error during auto logout:", error);
    }
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "artists"), (snapshot) => {
      setArtists(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "artists", id));
      setArtists(artists.filter((artist) => artist.id !== id));
    } catch (error) {
      console.error("❌ Failed to delete artist:", error);
    }
  };

  // 🔹 Calculate the start & end index for slicing artists
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArtists = artists.slice(startIndex, endIndex);

  // 🔹 Calculate total pages
  const totalPages = Math.ceil(artists.length / ITEMS_PER_PAGE);

 // 🔹 Ensure Firebase Token is Up-to-Date
  auth.currentUser?.getIdToken(true).then((idToken) => {
    console.log("🔄 New Token Fetched:", idToken);
  });


  return (
    <div className="flex">
      {/* 🔹 Sidebar */}
      <AdminSidebar />

      {/* 🔹 Main Content */}
      <div className="flex w-full justify-center items-center min-h-screen bg-white">
        {/* 🔹 Registered Artists List (Centered & Bordered) */}
        <div className="border border-gray-300 text-[#191919] md:rounded-[30px] md:shadow-lg max-w-[800px] py-40 px-10 md:py-10 md:px-10 md:h-auto h-full w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center">Registered Artists</h2>

          {/* 🔹 Artist List */}
          {paginatedArtists.map((artist) => (
            <div key={artist.id} className="flex justify-between items-center p-3 border-b border-gray-400">
              <span className="text-lg font-semibold">{artist.fullName}</span>
              <button onClick={() => handleDelete(artist.id)} className="text-red-500 text-2xl hover:text-red-700">
                <MdDelete className="text-[30px]" />
              </button>
            </div>
          ))}

          {/* 🔹 Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white hover:bg-green-600"}`}
              >
                Prev
              </button>

              <span className="px-4 py-2 font-semibold">{currentPage} / {totalPages}</span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white hover:bg-green-600"}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredArtists;

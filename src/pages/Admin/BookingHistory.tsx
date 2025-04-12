import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, Timestamp, where } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import AdminSidebar from "./AdminSidebar";
import ArtistCalendar from '../Artist/ArtistCalendar';
import { FaSearch } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import ProtectedRoute from "./ProtectedRoute";


interface Booking {
  id: string;
  requestId: number;
  artistName: string;
  clientUsername: string;
  selectedDates: string;
  status: string;
  createdAt: Timestamp;
}

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
  const itemsPerPage = 10;

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
      const fetchBookings = async () => {
        try {
          const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
    
          if (snapshot.empty) {
            setBookings([]);
            return;
          }
    
          const artistIds = new Set<string>();
    
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.artistId) artistIds.add(data.artistId);
          });
    
          const artistDocs = await getDocs(
            query(collection(db, "artists"), where("__name__", "in", [...artistIds]))
          );
    
          const artistMap = artistDocs.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data().fullName || "Unknown Artist";
            return acc;
          }, {} as Record<string, string>);
    
          const bookingsData: Booking[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
    
            return {
              id: docSnap.id,
              requestId: data.requestId || "N/A",
              artistName: artistMap[data.artistId] || "Unknown Artist",
              clientUsername: data.fullName || "Unknown Client", // ✅ Directly from bookings
              selectedDates: data.selectedDates || "N/A",
              status: data.status || "pending",
              createdAt: data.createdAt || Timestamp.now(),
            };
          });
    
          setBookings(bookingsData);
        } catch (error) {
          console.error("❌ Error fetching bookings:", error);
        }
      };
    
      fetchBookings();
    }, []);
    

  const filteredBookings = bookings.filter((booking) =>
    (filterStatus === "all" || booking.status === filterStatus) &&
    (searchTerm === "" || 
      booking.id.includes(searchTerm) || booking.requestId.toString().includes(searchTerm) || // Convert requestId to string
      booking.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientUsername.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <ProtectedRoute>
    <div className="flex">
      <AdminSidebar />
      <div className="flex w-full justify-center items-center min-h-screen bg-white">
        <div className="md:ml-[150px] border border-gray-300 text-[#191919] md:rounded-[30px] md:shadow-lg max-w-[1320px] py-40 md:py-10 px-5 md:h-auto h-full w-full">
          <h2 className="text-2xl font-semibold mb-5 text-center">Booking History</h2>
          
          <div className="flex justify-between items-center mb-5 space-x-4 md:space-x-0 relative z-10">
  {/* Search Input with Icon */}
  <div className="relative w-full max-w-xs">
    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border border-[#191919] border-opacity-30 pl-10 pr-3 p-3 rounded-full h-12 w-full focus:outline-none focus:ring-2 focus:ring-[#7db23a]"
    />
  </div>

  {/* Filter Dropdown with Icon */}
  <div className="relative w-full max-w-xs">
    <IoFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
    <select
      className="border border-[#191919] border-opacity-30 pl-10 pr-8 p-3 rounded-full h-12 appearance-none bg-white w-full focus:outline-none focus:ring-2 focus:ring-[#7db23a]"
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
      <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="cancelled">Cancelled</option>
        <option value="on-hold">On-hold</option>
        <option value="completed">Completed</option>
    </select>
  </div>
</div>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full border-collapse border border-white text-sm">
              <thead>
                <tr className="bg-[#7db23a] text-white text-center">
                  <th className="border p-2">Booking ID</th>
                  <th className="border p-2">Request ID</th>
                  <th className="border p-2">Artist Name</th>
                  <th className="border p-2">Client Name</th>
                  <th className="border p-2">Selected Dates</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b text-center">
                                            <td className="border p-2">{booking.id}</td>
                                            <td className="border p-2">#{booking.requestId}</td>
                                            <td className="border p-2">{booking.artistName}</td>
                                            <td className="border p-2">{booking.clientUsername}</td>
                                            <td className="border p-2">
                                            <button
                                                className="text-[#7db23a] hover:underline"
                                                onClick={() => {
                                                    if (Array.isArray(booking.selectedDates)) {
                                                        // Convert dates into ISO format YYYY-MM-DD
                                                        const parsedDates = booking.selectedDates.map((date: string) => 
                                                            new Date(date).toISOString().split("T")[0]
                                                        );
                                                        setSelectedDates(parsedDates);
                                                    } else {
                                                        setSelectedDates([]); // Ensure it's always an array
                                                    }
                                                    setShowCalendarOverlay(true);
                                                }}
                                            >
                                                Show
                                            </button>
                                        </td>

                                            <td className="border p-2">{booking.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="border p-4 text-center text-gray-500">
                                            No bookings available yet.
                                        </td>
                                    </tr>
                                )}
              </tbody>
            </table>
          </div>

          {showCalendarOverlay && selectedDates && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 py-10">
        <button
                className="absolute top-2 right-2 text-white text-3xl"
                onClick={() => {
                    setShowCalendarOverlay(false);
                    setSelectedDates(null);
                }}
            >
                ✖
            </button>

        <div className="relative w-full max-w-[800px] h-auto md:h-[700px] bg-white md:px-5 py-3 md:py-4 rounded-[30px] shadow-lg overflow-y-hidden">  
        <div className="w-full h-full overflow-y-auto"> 
            <ArtistCalendar
                bookedDates={selectedDates}  // Ensure dates are formatted properly
                unavailableDates={[]} 
                setUnavailableDates={() => {}} 
                setChangesMade={() => {}} 
                isReadOnly={true}
            />
            <div className="[font-family:'Khula',Helvetica] text-xs text-center space-x-2">
          <span className="text-red-500 text-lg">●</span> Booked
        </div>
        </div>
        </div>
    </div>
)}


          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white"}`}
                disabled={currentPage === 1}
              >
                ◄
              </button>
              <span className="px-4 py-2 text-gray-800">{currentPage}/{totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white"}`}
                disabled={currentPage === totalPages}
              >
                ►
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default BookingHistory;

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoFilter } from 'react-icons/io5';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import authp from '/images/authp.png';
import { useNavigate } from 'react-router-dom';
import { FaRegEye } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";

interface Booking {
    id: string;
    userName: string;
    requestId: string;
    createdAt: { seconds: number; nanoseconds: number };
    status?: string;
    clientId: string;
    artistId: string;
  }
  
  const RequestDashboard = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchBookings = async () => {
        try {
          const q = query(collection(db, "bookings"), where("artistId", "==", auth.currentUser?.uid));
          const querySnapshot = await getDocs(q);
          
          const bookingsData: Booking[] = await Promise.all(
            querySnapshot.docs.map(async (docSnapshot) => {
              const data = docSnapshot.data() as Partial<Booking>;
  
              let userName = "Unknown User";
              if (data.clientId) {
                const userRef = doc(db, "users", data.clientId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  userName = userSnap.data().username || "Unknown User";
                }
              }
  
              return {
                id: docSnapshot.id,
                userName: userName,
                requestId: data.requestId || "",
                createdAt: data.createdAt || { seconds: 0, nanoseconds: 0 },
                status: data.status ? data.status.toLowerCase() : "pending",
                clientId: data.clientId || "",
                artistId: data.artistId || "",
              } as Booking;
            })
          );
          setBookings(bookingsData);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      };
  
      fetchBookings();
    }, []);
  
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value.toLowerCase());
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterStatus(e.target.value);
    };
    
    const filteredBookings = bookings.filter((booking) => {
      const searchTermLower = searchTerm.toLowerCase();
    
      // ✅ Convert requestId to string safely before using .toLowerCase()
      const requestIdString = booking.requestId ? String(booking.requestId).toLowerCase() : "";
    
      // ✅ Search logic: Match Username, Request ID, or Status
      const matchesSearch =
        booking.userName.toLowerCase().includes(searchTermLower) ||
        requestIdString.includes(searchTermLower) ||
        booking.status?.toLowerCase().includes(searchTermLower);
    
      const matchesFilter = filterStatus === "All" || booking.status?.toLowerCase() === filterStatus.toLowerCase();
    
      return matchesSearch && matchesFilter;
    });
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return "text-orange-500";
        case "active":
          return "text-[#7db23a]";
        case "cancelled":
          return "text-red-500";
        case "on-hold":
          return "text-[#8A8A8A]";
        case "completed":
          return "text-[#00E1FF]";
        default:
          return "text-gray-500";
      }
    };

    const handleNavigate = (path: string) => {
      navigate(path);
      setTimeout(() => {
        window.location.reload(); // ✅ Ensures page reload
      }, 0); // Small delay to prevent unnecessary fast triggers
    };

    const startChatWithClient = async (clientId: string) => {
      if (!auth.currentUser) return alert("You need to be logged in!");
    
      const artistId = auth.currentUser.uid;
    
      try {
        // ✅ Check if chat already exists
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("users", "array-contains", artistId));
        const chatSnapshot = await getDocs(q);
    
        let existingChat: { id: string; users: string[] } | null = null; // ✅ Ensure correct type
    
        chatSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as { users: string[] }; // ✅ Ensure correct type
          if (data.users.includes(clientId)) {
            existingChat = { id: docSnapshot.id, users: data.users }; // ✅ Assign correct structure
          }
        });
    
        if (existingChat !== null) { 
          // ✅ TypeScript now knows existingChat is not null, so accessing .id is safe
          handleNavigate(`/messages/${(existingChat as { id: string }).id}`);
          return; // 🚀 Ensure early return to prevent unnecessary execution
        }
    
        // ✅ Otherwise, create a new chat
        const newChatRef = await addDoc(collection(db, "chats"), {
          users: [artistId, clientId], // ✅ Store both user IDs
          artistId,
          clientId,
          lastMessage: "",
          lastMessageTimestamp: null,
        });
    
        // ✅ Navigate to the newly created chat
        handleNavigate(`/messages/${newChatRef.id}`);
      } catch (error) {
        console.error("Error starting chat:", error);
        alert("Failed to start a chat. Please try again.");
      }
    };
  
  return (
    <div className="min-h-screen bg-cover bg-center p-6 md:px-12 xl:px-16" style={{ backgroundImage: `url(${authp})` }}>
  <div className="flex flex-row flex-wrap justify-between items-center mt-20 md:mt-28 p-1 pb-6 space-y-2 md:space-y-0">
  <h1 className="[font-family:'Khula',Helvetica] text-lg font-semibold text-white hidden md:block">
    Request Dashboard
  </h1>
  <div className="flex flex-row space-x-2 md:space-x-4">
    <div className="relative flex-1 md:flex-initial">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange}
        className="pl-10 pr-4 py-2 bg-black bg-opacity-25 text-white rounded-full w-full md:w-auto focus:outline-none"
      />
      <FaSearch className="absolute left-3 top-2.5 text-white" />
    </div>
    <div className="relative flex-1 md:flex-initial">
      <select
        value={filterStatus}
        onChange={handleFilterChange}
        className="pl-10 pr-4 py-2 bg-black bg-opacity-25 text-white rounded-full w-full md:w-auto focus:outline-none appearance-none"
      >
        <option value="All">All</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="cancelled">Cancelled</option>
        <option value="on-hold">On-hold</option>
        <option value="completed">Completed</option>
      </select>
      <IoFilter className="absolute left-3 top-2.5 text-white" />
    </div>
  </div>
</div>

<div className="bg-black bg-opacity-25 rounded-2xl px-2 py-3 md:p-8 xl:p-7 overflow-x-auto mx-auto w-full">
  <div className="md:grid grid-cols-5 gap-0 md:gap-2 md:pb-4 border-b border-gray-500 text-[10px] md:text-sm hidden">
    <p className="[font-family:'Khula',Helvetica] text-white text-opacity-50 font-semibold truncate mt-2">Project Status</p>
    <p className="[font-family:'Khula',Helvetica] text-white text-opacity-50 font-semibold truncate mt-2">Request ID</p>
    <p className="[font-family:'Khula',Helvetica] text-white text-opacity-50 font-semibold truncate mt-2">Username</p>
    <p className="[font-family:'Khula',Helvetica] text-white text-opacity-50 font-semibold truncate mt-2">Request Date</p>
  </div>

  {filteredBookings.length === 0 ? (
    <p className="text-center text-white text-opacity-70 font-semibold md:mt-10">No bookings at the moment.</p>
  ) : (
    filteredBookings.map((booking) => (
      <div 
        key={booking.id} 
        className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 py-3 md:py-4 border-b border-gray-500 text-xs md:text-sm px-3 md:px-0 items-center"
      >
    {/* Project Status & Request ID (Mobile grouped together, Desktop remains separate) */}
    <div className="flex items-center gap-2 md:gap-1">
      <span className={`text-3xl md:text-3xl ${getStatusColor(booking.status || 'pending')}`}>●</span>
      <p className="text-white truncate text-sm md:hidden">#{booking.requestId}</p>
      <p className={`font-semibold hidden md:block truncate ${getStatusColor(booking.status || 'pending')}`}>
        {(booking.status || 'pending').toUpperCase()}
      </p>
    </div>

    {/* Request ID (Shown separately for desktop) */}
    <p className="text-white truncate text-sm hidden md:block">#{booking.requestId}</p>

    {/* Username */}
    <p className="text-white truncate text-sm md:text-sm">@{booking.userName}</p>

    {/* Request Date */}
    <p className="text-white truncate text-sm md:text-sm">
      {booking.createdAt?.seconds 
        ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() 
        : 'N/A'}
    </p>

    {/* Actions - Mobile Icons & Desktop Buttons */}
    <div className="flex flex-row gap-5 xl:gap-5 md:gap-0 md:flex-row md:space-x-5 text-xs md:text-sm">
      {/* Mobile Icons */}
      <button 
        onClick={() => handleNavigate(`/client-booking/${booking.id}`)} 
        className="text-[#7db23a] md:hidden"
      >
        <FaRegEye size={18} />
      </button>
      <button 
        onClick={() => startChatWithClient(booking.clientId)} 
        className="text-white md:hidden"
      >
        <MdMailOutline size={18} />
      </button>

      {/* Desktop View & Message Buttons (Hidden on Mobile) */}
      <button 
        onClick={() => handleNavigate(`/client-booking/${booking.id}`)} 
        className="hover:underline text-[#7db23a] hidden md:block"
      >
        View
      </button>
      <button 
        onClick={() => startChatWithClient(booking.clientId)} 
        className="text-white hover:underline hidden md:block"
      >
        Message
      </button>
    </div>
  </div>
 ))
  )}
</div>
    </div>
  );
};

export default RequestDashboard;

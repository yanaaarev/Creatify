import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../config/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import authp from "/images/authp.png";
import "../Artist/ArtistCalendar.css";

const BookingCalendar = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artistData, setArtistData] = useState<any>(null);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [, setInitialDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!artistId) return; // ✅ Ensure we have an artist ID from the URL
      setLoading(true);
  
      try {
        // 🔹 Fetch Selected Artist's Data (Profile & Unavailable Dates)
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
  
        let fetchedArtistData: any = null;
        let fetchedUnavailableDates: string[] = [];
  
        if (artistSnap.exists()) {
          fetchedArtistData = artistSnap.data();
          fetchedUnavailableDates = Array.isArray(fetchedArtistData.unavailableDates) ? fetchedArtistData.unavailableDates : [];
        }
  
        // 🔹 Fetch Active Booked Dates for the Selected Artist
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("artistId", "==", artistId), // ✅ Ensure correct artist ID
          where("status", "==", "active") // ✅ Fetch only ACTIVE bookings
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

         // ✅ Restore previously selected dates
         const storedDates = sessionStorage.getItem("selectedDates");
         const parsedDates = storedDates ? JSON.parse(storedDates) : [];

         setArtistData(fetchedArtistData);
         setUnavailableDates(fetchedUnavailableDates);
         setBookedDates(uniqueBookedDates);
         setSelectedDates(parsedDates); // ✅ Restore selected dates from sessionStorage

          // ✅ Determine the first selected date to set initial view
          if (parsedDates.length > 0) {
            setInitialDate(parsedDates.sort()[0]); // 🔥 Set to the earliest selected date
        }
  
        console.log("✅ Fetched Artist Data:", fetchedArtistData);
        console.log("✅ Fetched Unavailable Dates:", fetchedUnavailableDates);
        console.log("✅ Fetched Active Booked Dates:", uniqueBookedDates);
  
        // ✅ Update State with Fetched Data
        if (fetchedArtistData) setArtistData(fetchedArtistData); // ✅ Set the correct artist data
        setUnavailableDates(fetchedUnavailableDates);
        setBookedDates(uniqueBookedDates);
      } catch (error) {
        console.error("❌ Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAvailabilityData();
  }, [artistId]); // ✅ Depend on `artistId` to re-fetch when URL changes
  

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.dateStr);
    clickedDate.setHours(8, 0, 0, 0); // Ensure it's in Philippines Time (UTC+8)

    const today = new Date();
    today.setHours(8, 0, 0, 0); // Ensure it's in Philippines Time

    // ✅ Ensure bookingNotice is a valid number
    const bookingNotice = Number(artistData?.bookingNotice) || 0;

    if (isNaN(bookingNotice) || bookingNotice < 0) {
        console.error("Invalid booking notice value:", artistData?.bookingNotice);
        alert("Error: Invalid booking notice setting.");
        return;
    }

    // ✅ Calculate the correct minimum allowed date considering unavailable dates
    let minAllowedDate = new Date(today);
    minAllowedDate.setDate(today.getDate() + bookingNotice); // Apply notice period
    minAllowedDate.setHours(8, 0, 0, 0); // Ensure timezone consistency

    // 🚨 Convert to Philippines format YYYY-MM-DD
    const formatDate = (date: Date) => date.toLocaleDateString("en-CA"); 

    // 🚨 Skip unavailable dates after the notice period until we find a valid day
    while (unavailableDates.includes(formatDate(minAllowedDate))) {
        minAllowedDate.setDate(minAllowedDate.getDate() + 1);
    }

    console.log("Today:", formatDate(today));
    console.log("Clicked Date:", formatDate(clickedDate));
    console.log("Booking Notice (Days):", bookingNotice);
    console.log("Min Allowed Date (Adjusted for Unavailable Days):", formatDate(minAllowedDate));

    // 🔴 Prevent past date selection
    if (clickedDate < today) {
        alert("You cannot select past dates.");
        return;
    }

    // 🔴 Enforce Booking Notice + Unavailable Date Skipping
    if (clickedDate < minAllowedDate) {
        alert(`You must book after ${bookingNotice} days. The next available date is ${formatDate(minAllowedDate)}.`);
        return;
    }

    if (bookedDates.includes(info.dateStr)) {
      alert("This date is already booked.");
      return;
  }

    // 🔴 Prevent selecting unavailable or booked dates
    if (unavailableDates.includes(info.dateStr)) {
        alert("This date is unavailable.");
        return;
    }

    // ✅ Toggle Selection (Remove if already selected)
    let newSelectedDates = [...selectedDates];
    if (newSelectedDates.includes(info.dateStr)) {
        newSelectedDates = newSelectedDates.filter((date) => date !== info.dateStr);
    } else {
        // ✅ Ensure selection stays within min/max booking days
        const minBookingDays = Number(artistData?.minBookingDays) || 1;
        const maxBookingDays = Number(artistData?.maxBookingDays) || 10;

        if (isNaN(minBookingDays) || isNaN(maxBookingDays) || minBookingDays < 1 || maxBookingDays < 1) {
            console.error("Invalid min/max booking days:", artistData?.minBookingDays, artistData?.maxBookingDays);
            alert("Error: Invalid min/max booking days setting.");
            return;
        }

        console.log("Minimum Booking Days:", minBookingDays);
        console.log("Maximum Booking Days:", maxBookingDays);

        if (newSelectedDates.length >= maxBookingDays) {
            alert(`You can only book up to ${maxBookingDays} days.`);
            return;
        }

        newSelectedDates.push(info.dateStr);
    }

    setSelectedDates(newSelectedDates);
};

 // ✅ Handle Booking Submission (Pass Selected Dates via URL)
 const handleNext = () => {
  if (!auth.currentUser) {
    navigate("/client-login");
    return;
  }

  if (selectedDates.length < (artistData?.minBookingDays || 5)) {
    alert(`You must select at least ${artistData?.minBookingDays || 5} days.`);
    return;
  }

  // ✅ Save selected dates in sessionStorage
  sessionStorage.setItem("selectedDates", JSON.stringify(selectedDates));

  // Pass selectedDates to the next page via URL
  const queryParams = new URLSearchParams();
  queryParams.append("dates", selectedDates.join(","));
  navigate(`/book-artist/${artistId}/booking-request?${queryParams.toString()}`);
};


  const customStyles = `
  .fc .fc-day-today {
    background-color: transparent !important;
    border: 3px solid black !important;
    box-sizing: border-box !important;
  }
    .fc .fc-daygrid-day:hover {
  background: rgba(125, 178, 58, 0.3);
  transform: scale(1.1);
}
`;

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${authp})` }}>
      <div className="bg-white px-[30px] py-16 md:py-12 md:px-12 md:rounded-[30px] shadow-lg w-full max-w-3xl">
        {/* 🔙 Back Button */}
        <button className="text-[#8C8C8C] text-4xl mt-5" onClick={() => navigate(-1)}>
          <IoChevronBackCircleOutline />
        </button>

        {/* 🗓️ Booking Header */}
<div className="flex justify-between items-center mt-5">
  <h2 className="[font-family:'Khula',Helvetica] text-sm font-semibold">Select your preferred project date:</h2>
  <p className="[font-family:'Khula',Helvetica] text-xs font-normal text-[#191919] text-opacity-50 text-right">
    Project Duration ({artistData?.minBookingDays}-{artistData?.maxBookingDays} days)
  </p>
</div>

        {/* 📅 Booking Calendar */}
        <div className="mt-4">
      <style>{customStyles}</style>
      {loading ? (
        <p className="text-center text-gray-500">Loading calendar...</p>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={selectedDates.length > 0 ? selectedDates.sort()[0] : undefined} // 🔥 Fix: Show the first selected date
          selectable={true}
          dateClick={handleDateClick}
          events={[
            ...unavailableDates.map((date) => ({ start: date, color: "gray" })),
            ...bookedDates.map((date) => ({ start: date, color: "red" })),
            ...selectedDates.map((date) => ({ start: date, color: "#7db23a" })),
          ]}
          eventDisplay="background"
          headerToolbar={{ start: "prev", center: "title", end: "next" }}
          buttonText={{ prev: "‹", next: "›" }}
        />
      )}
        </div>

        {/* 📌 Date Indicators */}
        <div className="[font-family:'Khula',Helvetica] text-xs text-center mt-2 space-x-2">
          <span className="text-black text-lg">●</span> Available
          <span className="text-[#191919] text-opacity-50 text-lg">●</span> Not Available
          <span className="text-red-500 text-lg">●</span> Booked
          <span className="text-[#7db23a] text-lg">●</span> Selected
        </div>

 {/* ℹ️ Booking Notes */}
 <div className="[font-family:'Khula',Helvetica] mt-4 flex flex-col md:flex-row text-sm text-[#191919] text-opacity-50 leading-normal">
          <div className="flex-1">
            <h3 className="[font-family:'Khula',Helvetica] font-semibold">Minimum & Maximum Days:</h3>
            <ul className="list-disc ml-4">
              <li>Select a range of dates within the allowed booking window.</li>
              <li>You can only select within the available dates.</li>
              <li>If your selection is outside availability, you'll need to adjust.</li>
            </ul>
          </div>
          <div className="flex-1 mt-4 md:mt-0">
            <h3 className="[font-family:'Khula',Helvetica] font-semibold md:ml-6">Availability Selection:</h3>
            <ul className="list-disc ml-4 md:ml-10">
              <li>Click on available dates to select them.</li>
              <li>Unavailable & booked dates are not clickable.</li>
              <li>You can select multiple dates within the allowed range.</li>
            </ul>
          </div>
        </div>

        {/* ➡️ Next Button */}
        <button className="bg-[#7db23a] text-white px-6 py-2 rounded-full w-full mt-6"
          onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingCalendar;

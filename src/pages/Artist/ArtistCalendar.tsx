import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./ArtistCalendar.css"; // Custom styles

interface ArtistCalendarProps {
  unavailableDates: string[];
  bookedDates?: string[];
  pendingDates?: string[];
  setUnavailableDates: (dates: string[]) => void;
  setChangesMade: (changed: boolean) => void;
  isReadOnly?: boolean;
  initialDate?: string; // ✅ Allows setting initial month
  currentMonth?: Date // Add this field
  selectedDates?: Date[]
}

const ArtistCalendar: React.FC<ArtistCalendarProps> = ({
  unavailableDates,
  bookedDates = [],
  pendingDates = [],
  setUnavailableDates,
  setChangesMade,
  isReadOnly = false,
}) => {
  const [, setCurrentMonth] = useState(new Date());
  // ✅ Ensure dates are in proper format & avoid duplicates
  const computedEvents = useMemo(() => {
    const normalizedUnavailable = unavailableDates.filter(date => !bookedDates.includes(date));
    return [
      ...normalizedUnavailable.map(date => ({ start: date, color: "gray" })), // Unavailable dates (gray)
      ...bookedDates.map(date => ({ start: date, color: "red" })), // Booked dates (red)
      ...pendingDates.map(date => ({ start: date, color: "#e1ad01" })), // Pending dates
    ];
  }, [unavailableDates, bookedDates]);

 // ✅ If we're in Client Booking Details, show the first booked date
const autoInitialDate = useMemo(() => {
  if (window.location.pathname.includes("/client-booking") || window.location.pathname.includes("/admin-booking-history")) {
    return bookedDates.length > 0 ? bookedDates.sort()[0] : new Date().toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0]; // ✅ Default to current month & date
}, [bookedDates]);


  const handleDateClick = (info: any) => {
    if (isReadOnly) return; // Prevent changes if readonly

    const clickedDate = info.dateStr;

    // ❌ Prevent modifying booked dates
    if (bookedDates.includes(clickedDate)) {
      alert("This date is already booked by a client and cannot be modified.");
      return;
    }

    // ✅ Toggle unavailable date
    const updatedDates = unavailableDates.includes(clickedDate)
      ? unavailableDates.filter(date => date !== clickedDate) // Remove if already in unavailable
      : [...unavailableDates, clickedDate]; // Add if not already set

    setUnavailableDates(updatedDates);
    setChangesMade(true);
  };

  return (
    <div className="calendar-container">
      <div className="custom-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={autoInitialDate} // ✅ Automatically navigate to booked/unavailable month
          selectable={!isReadOnly}
          dateClick={isReadOnly ? undefined : handleDateClick}
          events={computedEvents}
          eventDisplay="background"
          headerToolbar={{
            start: "prev",
            center: "title",
            end: "next",
          }}
          buttonText={{
            prev: "\u2039",
            next: "\u203a",
          }}
          datesSet={(info) => setCurrentMonth(new Date(info.view.currentStart))}
        />
      </div>
    </div>
  );
};

export default ArtistCalendar;

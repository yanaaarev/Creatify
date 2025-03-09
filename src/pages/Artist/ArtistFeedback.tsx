import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface Feedback {
    id: string;
    username: string;
    date: { seconds: number; nanoseconds: number }; // ✅ Firestore Timestamp type
    rating: number;
    comment: string;
    artistId: string;
  }
  
  interface ArtistFeedbackProps {
    artistId: string;
    feedbacks: Feedback[]; // ✅ Now receives feedbacks as a prop
  }
  
  const ArtistFeedback = ({ feedbacks }: ArtistFeedbackProps): JSX.Element => {
    const [showAll, setShowAll] = useState(false);

      // ✅ Limit displayed feedbacks to 3 when collapsed
  // ✅ Sort feedbacks by latest date before displaying
const sortedFeedbacks = [...feedbacks].sort((a, b) => b.date.seconds - a.date.seconds);
const visibleFeedbacks = showAll ? sortedFeedbacks : sortedFeedbacks.slice(0, 3);

    return (
      <div className="flex flex-col gap-4 mt-20 w-full max-w-[600px] mx-auto mb-10">
        <h2 className="[font-family:'Khula',Helvetica] text-white text-xl font-medium text-center">Client Review</h2>
  
         {/* ✅ Feedback List */}
      {feedbacks.length > 0 ? (
        <>
          {visibleFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-[#7DB23A] rounded-[30px] w-full h-[150px] px-8 py-8 md:p-10 md:px-12 text-white shadow-md mb-4">
              {/* Header: Username, Date, and Rating */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold text-sm">@{feedback.username}</span>
                <span className="text-sm font-semibold">
                  {new Date(feedback.date.seconds * 1000).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{feedback.rating}</span>
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} className={index < feedback.rating ? "text-[#FFC700]" : "text-gray-300"} />
                ))}
              </div>
            </div>

              {/* Feedback Message */}
              <p className="text-center text-sm mt-1 p-6">{feedback.comment}</p>
            </div>
          ))}

          {/* ✅ "See More" & "Close" Buttons */}
          {feedbacks.length > 3 && (
            <div className="text-center">
              <button
                className="text-white px-4 py-2 text-sm hover:underline font-semibold"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Close" : "See More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">No feedback available yet.</p>
      )}
    </div>
  );
};
  export default ArtistFeedback;
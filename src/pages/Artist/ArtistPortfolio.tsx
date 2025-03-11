import { useState, useRef, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

interface PortfolioFile {
  url: string;
  type: string; // "image/png", "video/mp4", etc.
  width: number;
  height: number;
}

interface ArtistPortfolioProps {
  portfolioImages: PortfolioFile[];
}

const ArtistPortfolio: React.FC<ArtistPortfolioProps> = ({ portfolioImages = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<PortfolioFile | null>(null);
  
  // Scroll left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex justify-center -mt-[60px] px-4">
      <div className="w-full md:w-[900px] xl:w-[1250px] mt-20 relative">
        {/* Scrollable Portfolio Section */}
        <div className="relative">
          {/* Left Scroll Button */}
          {portfolioImages.length > 1 && (
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
              onClick={scrollLeft}
            >
              <FaArrowLeft size={20} />
            </button>
          )}

          {/* Scrollable Container */}
          <div className="overflow-hidden relative w-full">
            <div
              ref={scrollRef}
              className="flex gap-5 whitespace-nowrap snap-x snap-mandatory overflow-x-auto"
              style={{
                WebkitOverflowScrolling: "touch", // Smooth scrolling for mobile
                scrollbarWidth: "none", // Hide scrollbar for Firefox
                msOverflowStyle: "none", // Hide scrollbar for IE/Edge
              }}
            >
              {/* ✅ Hide scrollbar for Chrome, Safari, Edge */}
              <style>
                {`
                  ::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>

              {portfolioImages.length > 0 ? (
  portfolioImages.slice(0, 5).map((file, index) => {
    if (!file?.url || !file?.type) return null;

  // ✅ Create a local state for detecting orientation per image
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  useEffect(() => {
    if (file.type.startsWith("video")) {
      setIsLandscape(true); // ✅ Videos are always landscape
    } else {
      const img = new Image();
      img.src = file.url;
      img.onload = () => setIsLandscape(img.width > img.height);
    }
  }, [file.url]);
  
    return (
      <div
        key={index}
        className={`relative flex-shrink-0 snap-start cursor-pointer rounded-lg ${
          index === 4 ? "w-[40%]" : "w-[25%]" // ✅ Ensures the 5th thumbnail is half-visible
        }`}
        style={{
          height: "450px", // ✅ Same height for both portrait & landscape
          width: isLandscape === null 
            ? "300px" // ✅ Default until dimensions load
            : isLandscape
            ? "600px" // ✅ Landscape width on desktop
            : "300px",
  
          maxWidth: isLandscape ? "80vw" : "300px", // ✅ Responsive landscape width on mobile
          minWidth: isLandscape ? "320px" : "300px", // ✅ Prevents landscape from being too small
        }}
        onClick={() => setSelectedMedia(file)}
        onContextMenu={(e) => e.preventDefault()} // ✅ Prevent Save As
      >
        {file.type.startsWith("video") ? (
          <video
            src={file.url}
            className="w-full h-full object-cover rounded-lg" // ✅ Video fully fills the thumbnail
            muted
            loop
            controlsList="nodownload" // ✅ Disables Download Button
          />
        ) : (
          <img
            src={file.url}
            className="w-full h-full object-cover rounded-lg"
            draggable={false}
          />
        )}
        {/* Watermark for Thumbnails */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-opacity-30 text-xl md:text-2xl font-bold">
          CREATIFY
        </div>
      </div>
    );
  })
) : (
  // Placeholder Images when no portfolio images are available
  Array.from({ length: 5 }).map((_, index) => (
    <div
      key={index}
      className={`relative flex-shrink-0 snap-start bg-cover bg-center rounded-lg ${
        index === 4 ? "w-[40%]" : "w-[25%]" // ✅ Ensures last thumbnail is half-visible
      }`}
      style={{ backgroundImage: `url('/default-portfolio.png')`, height: "450px", width: "300px" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
        CREATIFY
      </div>
    </div>
  ))
)}
            </div>
          </div>

          {/* Right Scroll Button */}
          {portfolioImages.length > 1 && (
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
              onClick={scrollRight}
            >
              <FaArrowRight size={20} />
            </button>
          )}
        </div>
      </div>

    {/* ✅ Overlay for Fullscreen Image/Video with Watermark */}
{selectedMedia && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
    {/* ❌ Close Button */}
    <button
      className="absolute top-4 right-4 bg-white p-3 rounded-full text-black shadow-md"
      onClick={() => setSelectedMedia(null)}
    >
      <FaTimes size={24} />
    </button>

    <div className="relative flex items-center justify-center">
      {/* Watermark for Fullscreen View */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-3xl md:text-5xl font-bold opacity-30 pointer-events-none">
        CREATIFY
      </div>

      {selectedMedia.type.startsWith("video") ? (
        <video
          src={selectedMedia.url}
          className="rounded-lg"
          style={{
            maxWidth: "90vw", // ✅ Prevents overflow on larger screens
            maxHeight: "90vh", // ✅ Ensures video is contained within viewport
          }}
          controls
          controlsList="nodownload" // ✅ Disables Download Button
          onContextMenu={(e) => e.preventDefault()} // ✅ Prevent Save As
        />
      ) : (
        <img
          src={selectedMedia.url}
          className="rounded-lg"
          style={{
            maxWidth: "90vw", // ✅ Ensures no overflow
            maxHeight: "90vh", // ✅ Ensures proper containment
            objectFit: "contain", // ✅ Prevents distortion
          }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()} // ✅ Prevent Save As
        />
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default ArtistPortfolio;

import { useNavigate } from "react-router-dom";
import N1 from "/images/senenartwork.png";
import ARTEORK from "/images/ARTEORK.png";
import CREATIFYElements111 from "/images/faqs.png";
import WHATWEDO from "/images/whatwedo.png";
import CREATIFYElements131 from "/images/ayaa.png";

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1E1E1E] flex flex-col items-center w-full min-h-screen">
      <div className="w-full max-w-[1585px] flex-grow">
        {/* Hero Section */}
        <div className="relative w-full h-screen md:min-h-screen bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-6 py-10 md:px-0 md:py-0 text-center">
          <h1 className="text-white font-bold text-3xl md:text-5xl px-1 leading-snug max-w-[1000px] md:max-w-[1200px] mb-2">
            CREATE WITH OUR OUTSTANDING ARTISTS WHO CAN TURN YOUR IMAGINATION
            INTO REALITY.
          </h1>
          <button
            className="[font-family:'Khula',Helvetica] mt-6 w-[250px] h-[50px] md:w-[300px] md:h-[60px] flex items-center justify-center bg-[#7db23a] rounded-full shadow-lg text-white font-semibold text-lg md:text-xl text-center leading-none"
            onClick={() => navigate("/artist-gallery")}
          >
            DISCOVER OUR ARTISTS
          </button>
        </div>

        {/* What We Do Section */}
        <div className="relative flex flex-row md:flex-row items-center w-full md:py-20 md:px-0 bg-[#1E1E1E]">
          {/* Left Image */}
          <img
            className="w-full max-w-[220px] md:max-w-[610px] object-cover"
            src={ARTEORK}
            alt="Arteork"
          />

          {/* Right Text Content with Background Image */}
          <div
            className="relative w-full min-h-[400px] md:min-h-[900px] flex flex-col justify-center items-start md:items-start text-white text-left md:text-left px-4 md:px-10 bg-cover bg-right md:bg-right bg-no-repeat"
            style={{
              backgroundImage: "url('/images/awd-1.png')",
              backgroundPosition: "right 2px center",
              backgroundSize: "165%",
            }}
          >
            {/* WHAT WE DO Image */}
            <img
              src={WHATWEDO}
              alt="What We Do"
              className="mb-4 mt-7 md:mb-6 w-[180px] md:w-[250px] md:px-3 md:py-2"
            />

            {/* Text Content */}
            <div className="max-w-[790px] px-1 md:px-3">
              <p className="[font-family:'Khula',Helvetica] text-[10px] w-50 h-auto md:text-xl font-light leading-relaxed">
                <span className="font-bold">Creatify</span> focuses on{" "}
                <span className="font-bold">connecting people</span> with{" "}
                <span className="font-bold">artists </span>
                specializing in{" "}
                <span className="font-bold">
                  photography, videography, graphic design, video editing, and
                  traditional art.
                </span>
                The platform makes it easy for clients to find the right artist
                for their needs, ensuring high-quality work with the convenience
                of
                <span className="font-bold"> free booking</span> and{" "}
                <span className="font-bold">direct communication</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Artwork Section */}
        <div className="relative w-full flex flex-col items-center bg-[#1E1E1E]">
          <img className="w-full max-w-[1590px]" src={N1} alt="Artwork" />
          <div className="absolute -bottom-[110px] right-[10px] md:-bottom-[130px] md:right-[90px] bg-[#7db23a] rounded-full shadow-lg p-0 md:p-10 text-center w-[180px] h-[180px] md:w-[420px] md:h-[420px]">
            <p className="absolute top-[7px] left-1 md:top-[120px] md:left-[10px] text-white font-bold text-xs md:text-lg px-4 py-10 md:px-10 md:py-10">
              Creatify showcases artists and their creations, making it easy to
              discover a diverse range of talent for any project.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full h-[150px] text-center py-[170px] md:py-[200px] px-6 max-w-4xl mx-auto">
          <p className="text-white text-lg md:text-xl font-bold mb-4">
            Got questions? We’ve got answers!
          </p>
          <p className="text-white text-sm md:text-lg mb-6 px-6">
            Check out our <span className="font-bold">FAQs</span> to find
            everything you need to know about booking artists, exploring
            creative options, and making the most of your experience with{" "}
            <span className="font-bold">Creatify</span>.
          </p>
          <img
            className="w-40 md:w-60 mx-auto cursor-pointer"
            onClick={() => navigate("/faqs")}
            src={CREATIFYElements111}
            alt="FAQs"
          />
        </div>

        {/* Join Us Section */}
        <div
          style={{ backgroundImage: "url('/images/ww-1.png')" }}
          className="relative w-screen h-[450px] md:h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center pt-4 md:py-24 md:px-6"
        >
          <img
            className="w-40 md:w-[350px] mb-4 md:mb-6"
            src={CREATIFYElements131}
            alt="Creatify Elements"
          />
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScbH3ZaaJ4Jg0BCt9_0Lb9x494b1BAgbvfwwmND2wCC-h0gYg/viewform?fbclid=IwY2xjawIsdtJleHRuA2FlbQIxMAABHedzb_U7flPO_QfStOIIDnKbpHExIzU2j95DnplGb2YCtZH0xde6B0-Pug_aem_O7DnW37x0Dp61xoYWsjBzA"
            target="_blank"
            rel="noopener noreferrer"
            className="[font-family:'Khula',Helvetica] font-bold px-4 py-2 md:px-6 md:py-4 bg-[#7db23a] w-[200px] md:w-[310px] text-center rounded-full shadow-lg text-white text-lg"
          >
            APPLY NOW!
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import { useNavigate } from "react-router-dom";
import N1 from "/images/senenartwork.webp";
import ARTEORK from "/images/ARTEORK.webp";
import CREATIFYElements111 from "/images/faqs.webp";
import WHATWEDO from "/images/whatwedo.webp";
import CREATIFYElements131 from "/images/ayaa.webp";

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };


  return (
    <div className="bg-[#1E1E1E] flex flex-col items-center w-full min-h-screen">
      <div className="w-full flex-grow">
        {/* Hero Section */}
        <div className="relative w-full h-screen md:min-h-screen bg-[url('/images/bg.webp')] bg-cover bg-center bg-no-repeat bg-no-save flex flex-col items-center justify-center px-6 py-10 md:px-0 md:py-0 text-center">
          <h1 className="text-white font-bold text-3xl md:text-5xl px-1 leading-snug max-w-[1000px] md:max-w-[1200px] mb-2">
            CREATE WITH OUR OUTSTANDING ARTISTS WHO CAN TURN YOUR IMAGINATION
            INTO REALITY.
          </h1>
          <button
            className="[font-family:'Khula',Helvetica] mt-6 w-[250px] h-[50px] md:w-[300px] md:h-[60px] flex items-center justify-center bg-[#7db23a] rounded-full shadow-lg text-white font-semibold text-lg md:text-xl text-center leading-none"
            onClick={() => handleNavigate("/artist-gallery")}
          >
            DISCOVER OUR ARTISTS
          </button>
        </div>

        {/* What We Do Section */}
        <div className="relative flex flex-row md:flex-row items-center w-full h-auto md:py-16 md:px-0">
          {/* Left Image */}
          <img
            className="w-full max-w-[220px] md:max-w-[600px] xl:max-w-full object-cover"
            src={ARTEORK}
            alt="Arteork"
          />

          {/* Right Text Content with Background Image */}
          <div
            className="relative w-full min-h-[400px] md:min-h-[500px] xl:min-h-screen flex flex-col justify-center items-start md:items-start text-white text-left md:text-left px-4 md:px-10 bg-cover bg-no-save bg-right md:bg-right bg-no-repeat"
            style={{
              backgroundImage: "url('/images/awd-1.webp')",
              backgroundPosition: "right 2px center",
              backgroundSize: "165%",
            }}
          >
            {/* WHAT WE DO Image */}
            <img
              src={WHATWEDO}
              alt="What We Do"
              className="mb-4 mt-7 md:mb-6 w-[130px] md:w-[250px] md:px-3 md:py-2"
            />

            {/* Text Content */}
            <div className="w-full px-1 md:px-3">
              <p className="[font-family:'Khula',Helvetica] text-[10px] w-50 h-auto md:text-xl font-light leading-relaxed">
                <span className="font-bold">Creatify</span> welcomes and supports{" "}
                <span className="font-bold">artists</span> providing a platform where{" "}
                <span className="font-bold">clients can easily discover and connect with creatives </span>
                across various fields—{" "}
                <span className="font-bold">
                photography, videography, graphic design, video editing, traditional art, and more. {" "}
                </span>
                With
                <span className="font-bold"> free booking and direct communication, </span> finding the right artist has never been easier.
                {" "}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Artwork Section */}
        <div className="relative w-full flex flex-col items-center">
          <img className="w-full" src={N1} alt="Artwork" />
          <div className="absolute -bottom-[110px] right-[10px] md:-bottom-[130px] md:right-[90px] bg-[#7db23a] rounded-full shadow-lg p-0 md:p-10 text-center w-[180px] h-[180px] md:w-[420px] md:h-[420px]">
            <p className="absolute top-[7px] left-1 md:top-[120px] md:left-[10px] text-white font-bold text-xs md:text-lg px-4 py-10 md:px-10 md:py-10">
              Creatify showcases artists and their creations, making it easy to
              discover a diverse range of talent for any project.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full h-full text-center py-[170px] md:py-[200px] px-6 max-w-4xl mx-auto">
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
            className="w-40 md:w-60 mx-auto cursor-pointer pointer-events-auto"
            onClick={() => handleNavigate("/faqs")}
            src={CREATIFYElements111}
            alt="FAQs"
          />
        </div>

        {/* Join Us Section */}
        <div
          style={{ backgroundImage: "url('/images/ww-1.webp')", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover"
           }}
          className="relative w-full h-[300px] md:h-[1000px] bg-cover bg-center bg-no-repeat bg-no-save flex flex-col items-center justify-center pt-4 md:py-20 md:px-6"
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

{/* Behind the Visuals Section */}
<div style={{ backgroundImage: "url('/images/ww-1.webp')"
           }}
className="relative w-full h-[500px] md:min-h-screen flex flex-col items-center justify-center overflow-hidden">
  {/* Backdrop and Title */}
  <div className="w-full px-4 md:px-10 text-center z-10">
    <h1 className="text-white font-zenmaru font-bold text-6xl md:text-[200px] md:leading-[160px] relative z-10">
      BEHIND THE VISUALS
    </h1>
  </div>

  {/* Floating Artist Cards */}
  
  {/* Left card */}
<div className="absolute left-6 top-[90px] md:left-[160px] md:top-1/4 z-20 animate-float-slow">
  <div className="backdrop-blur-md text-white md:py-5 md:px-5 py-3 px-3 rounded-2xl shadow-2xl flex flex-col items-center gap-y-1 max-w-fit -rotate-[25deg]">
    <img
      src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1742279040/qwebxtzk3up2hetbmwpc.png"
      alt="drebsart"
      className="md:w-[100px] md:h-[100px] w-16 h-16 rounded-full object-cover border-2 border-white"
    />
    <p className="[font-family:'Khula',Helvetica] md:mt-5 text-xs md:text-sm font-light text-white text-center">Traditional Illustration</p>
    <p className="font-bold md:text-lg text-center -mt-2">@drebsart</p>
  </div>
</div>

  {/* Right card */}
  <div className="absolute right-6 bottom-[80px] md:right-[220px] md:bottom-[230px] z-20 animate-float-slower">
    <div className="backdrop-blur-md text-white md:py-5 md:px-8 py-3 px-6 rounded-2xl shadow-2xl flex flex-col items-center gap-y-1 max-w-fit rotate-[25deg]">
      <img
        src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1744330602/w0etc8c5tk2tpdmorkjw.jpg"
        alt="arts_xen"
        className="md:w-[100px] md:h-[100px] w-16 h-16 rounded-full object-cover border-2 border-white"
      />
      <div>
        <p className="[font-family:'Khula',Helvetica] md:mt-5 text-xs md:text-sm font-light text-white text-center">Digital Illustration</p>
        <p className="font-bold md:text-lg text-center -mt-1">@arts_xen</p>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default HomePage;

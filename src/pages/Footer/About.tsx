export const About = () => {
  return (
    <div className="relative w-full min-h-screen text-white font-Khula overflow-hidden px-5">
      {/* Hero Section */}
      <div
        className="relative w-full min-h-screen bg-no-repeat bg-center bg-cover text-center flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/images/aboutuz.webp')",
        }}
      >
        <h1 className="font-khula text-white font-bold text-7xl md:text-[200px] tracking-tighter leading-[50px] md:leading-[140px] pt-20">
          ABOUT<br />CREATIFY
        </h1>

        {/* Floating Cards */}
        <div className="absolute left-6 top-[300px] md:left-[180px] md:top-[190px] z-20 animate-float-slow">
          <div className="backdrop-blur-md text-white md:py-5 md:px-8 py-3 px-3 rounded-2xl shadow-2xl flex flex-col items-center gap-y-3 max-w-fit -rotate-[20deg]">
            <img
              src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652332/NATHALIE_vks9fk.png"
              alt="nathalie"
              className="md:w-[120px] md:h-[120px] w-16 h-16 rounded-full object-cover border-4 border-white"
            />
            <div className="text-center leading-tight">
              <p className="font-semibold md:text-lg">Nathalie</p>
              <p className="font-semibold md:text-lg -mt-2">Sarmiento</p>
            </div>
          </div>
        </div>

        <div className="absolute left-20 top-[510px] md:left-[500px] md:top-[480px] z-20 animate-float-slow">
          <div className="backdrop-blur-md text-white md:py-5 md:px-8 py-3 px-3 rounded-2xl shadow-2xl flex flex-col items-center gap-y-3 max-w-fit -rotate-[10deg]">
            <img
              src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652331/YANA_qbgbec.png"
              alt="reannah"
              className="md:w-[120px] md:h-[120px] w-16 h-16 rounded-full object-cover border-4 border-white"
            />
            <div className="text-center leading-tight">
              <p className="font-semibold md:text-lg">Reannah</p>
              <p className="font-semibold md:text-lg -mt-2">Revellame</p>
            </div>
          </div>
        </div>

        <div className="absolute right-6 bottom-[450px] md:right-[350px] md:top-[130px] z-20 animate-float-slow">
          <div className="backdrop-blur-md text-white md:py-5 md:px-8 py-3 px-6 rounded-2xl shadow-2xl flex flex-col items-center gap-y-5 max-w-fit rotate-[30deg]">
            <img
              src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652332/CLARENCE_apq5uv.png"
              alt="clarence"
              className="md:w-[120px] md:h-[120px] w-16 h-16 rounded-full object-cover border-4 border-white"
            />
            <div className="text-center leading-tight">
              <p className="font-semibold md:text-lg">Clarence</p>
              <p className="font-semibold md:text-lg -mt-2">Lazaro</p>
            </div>
          </div>
        </div>

        <div className="absolute right-6 bottom-[215px] md:right-[150px] md:bottom-[100px] z-20 animate-float-slow">
          <div className="backdrop-blur-md text-white md:py-5 md:px-8 py-3 px-6 rounded-2xl shadow-2xl flex flex-col items-center gap-y-5 max-w-fit rotate-[10deg]">
            <img
              src="https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652333/ROVIC_nqzq5z.png"
              alt="rovic"
              className="md:w-[120px] md:h-[120px] w-16 h-16 rounded-full object-cover border-4 border-white"
            />
            <div className="text-center leading-tight">
              <p className="font-semibold md:text-lg">Rovic</p>
              <p className="font-semibold md:text-lg -mt-2">Navarro</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Text */}
      <div className="max-w-5xl mx-auto font-khula text-sm md:text-xl leading-relaxed text-white text-left space-y-4 pb-16 md:pb-20 md:py-40 px-3 md:px-20">
        <p>
          <strong>Creatify</strong> is a <strong>web-based platform</strong> designed to promote and <strong>support local artists</strong> by connecting them directly with clients in need of creative services. Whether you're looking for a <strong>graphic designer, photographer, illustrator, or any creative professional</strong>—Creatify helps you find the right artist with ease.
        </p>
        <p>
          Unlike <strong>traditional platforms</strong>, Creatify was built to offer a <strong>seamless, stress-free experience.</strong> With features like <strong>real-time booking calendars, free booking requests, and secure in-app messaging</strong>, we make collaboration simple and making it <strong>safe</strong> for both artists and clients.
        </p>
        <p>
          Our <strong>goal</strong> is to help <strong>local talent</strong> shine by giving artists <strong>full control</strong> over their <strong>work</strong> and <strong>schedule</strong>, while making it easier for clients to find the perfect match for their vision—whether it's for <strong>digital, on-location, or remote projects.</strong>
        </p>
        <p>
          We’re more than just a platform—we’re a <strong>growing community</strong> built to <strong>empower creatives</strong> and make art more <strong>accessible, transparent, and appreciated.</strong>
        </p>
        <p>
          At Creatify, we <strong>create to defy</strong> the usual boundaries of finding and working with talented artists.
        </p>
      </div>
     

      {/* People Behind Creatify */}
      <div className="py-16 md:py-40 px-6 text-center">
        <h2 className="text-7xl md:text-[180px] leading-[50px] md:leading-[140px] tracking-tighter font-khula font-bold md:mt-10 mb-10 md:mb-40">PEOPLE BEHIND CREATIFY</h2>
        <div className="max-w-4xl mx-auto flex flex-col gap-16 md:gap-0">
        {[
  {
    name: "NATHALIE SARMIENTO",
    roles: "Head Graphic Designer | Head UI Designer | Head Creative Strategist",
    desc:
      "Nathalie handled the overall design of Creatify. From the layout to the user experience, she made sure the platform looks clean, feels easy to use, and fits well with the creative community it’s made for.",
    img: "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652336/CP_NATH_evea0l.png",
  },
  {
    name: "REANNAH REVELLAME",
    roles: "Head Technical Strategist | Head System Developer",
    desc:
      "Reannah focused on the system’s structure and functionality. She developed the core features like the calendar, booking flow, and user login to make sure everything works the way it should.",
    img: "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652335/CP_YANA_rliirs.png",
  },
  {
    name: "CLARENCE LAZARO",
    roles: "Head Communications Coordinator | Creative Strategist",
    desc:
      "Clarence worked on how Creatify speaks to its users—through words, tone, and overall messaging. He helped shape the platform’s voice while also giving input on visuals and creative direction.",
    img: "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652332/CP_CLAR_qausin.png",
  },
  {
    name: "ROVIC NAVARRO",
    roles: "Communications Coordinator | Graphic Designer",
    desc:
      "Rovic supported both design and content. He helped create visuals, layouts, and assisted in organizing communication materials for the platform.",
    img: "https://res.cloudinary.com/ddjnlhfnu/image/upload/v1745652332/CP_ROVIC_ezcbup.png",
  },
].map(({ name, roles, desc, img }, index) => (
  <div
    key={name}
    className={`flex flex-col md:flex-row ${
      index % 2 !== 0 ? "md:flex-row-reverse" : ""
    } items-center`}
  >
    <img src={img} alt={name} className="w-[260px] md:w-[360px] hover:animate-pulse pointer-events-auto" />
    <div
      className={`max-w-xl ${
        index % 2 !== 0 ? "md:text-right" : "md:text-left"
      }`}
    >
      <h3 className="text-xl md:text-3xl font-bold uppercase mb-2">{name}</h3>
      <p className="text-sm md:text-xl text-white font-medium mb-4">{roles}</p>
      <hr className="border-white border-opacity-20 mb-4" />
      <p className="[font-family:'Khula',Helvetica] text-sm md:text-lg font-light leading-relaxed">{desc}</p>
    </div>
  </div>
))}

        </div>
      </div>
    </div>
  );
};

export default About;
import authp from "/images/authp.webp"; // Adjust path based on project structure

export const About = (): JSX.Element => {
  return (
    <div className="bg-[#191919] flex justify-center w-full">
      <div className="relative flex justify-center items-center w-full min-h-screen overflow-x-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authp})` }}
        />

        {/* Content */}
        <div className="relative w-[90%] max-w-[1324px] text-center mt-11">
          {/* Heading */}
          <h1 className="[font-family:'Khula',Helvetica] font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white mb-5">
            About Us
          </h1>

          {/* Description */}
          <p className="[font-family:'Khula',Helvetica] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white font-light leading-relaxed">
          Creatify started with a simple idea: to bridge the gap between artists and clients, creating a platform where collaboration thrives. As a group of friends passionate about art and storytelling, we saw the struggles many artists face—irregular bookings, unclear communication, and the lack of a centralized space to showcase their talents. So, we decided to create something different. <br></br><br></br>

Imagine you’re an artist trying to balance your creative flow with managing inquiries, schedules, and payments. That’s where Creatify comes in. We developed a time-based scheduling system to make things easier, allowing clients to view an artist's availability at a glance and book projects seamlessly. <br></br><br></br>

For clients, finding the right artist can feel overwhelming. How do you choose someone who fits your vision? Creatify solves that by showcasing artists’ profiles, specialties, and portfolios, making it easy to find your perfect match. <br></br><br></br>

And payments? We keep things fair and transparent. Clients pay securely through the platform, and artists receive their earnings promptly after we deduct a small platform fee to keep Creatify running smoothly. <br></br><br></br>

Our goal isn’t just to build a platform; it’s to nurture a community. Whether you’re commissioning your dream project or turning your art into a thriving business, Creatify is here to make your creative journey effortless and rewarding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

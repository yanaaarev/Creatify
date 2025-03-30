import untitled11 from "/images/authp.webp"; // Adjust the path as needed

export const HowToBookAnArtist = (): JSX.Element => {
  return (
    <div className="bg-[#191919] flex flex-col items-center justify-center w-full min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-top bg-[length:100%_auto]"
        style={{
          backgroundImage: `url(${untitled11})`,
          backgroundColor: "#191919",
        }}
      ></div>

      {/* Content Section */}
      <div className="relative z-10 w-[90%] max-w-[1324px] mx-auto mt-32 md:mt-36 lg:mt-40 mb-20 flex flex-col items-center">
        <div className="w-full max-w-[900px] text-center">
          <h1 className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-xl lg:text-2xl mb-6">
            How to Book an Artist
          </h1>

          {/* Containers */}
          <div className="flex flex-col gap-6 items-center text-left">
            {/* Step 1 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica]text-base md:text-lg font-semibold text-white mb-4">
                1. Browse the Artist Gallery
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                Explore the gallery to view a variety of artists. Browse through
                their profiles and find one whose style aligns with your project.
              </p>
            </div>

            {/* Step 2 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                2. Visit Artist Profile
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                Once you've found the artist you’re interested in, visit their
                profile to learn more about their work, style, and availability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                3. Check Availability
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                View the <span className="[font-family:'Khula',Helvetica] font-semibold">artist’s calendar</span> to
                check their available dates. Make sure to{" "}
                <span className="[font-family:'Khula',Helvetica] font-semibold">
                  note the minimum and maximum days
                </span>{" "}
                required for completing the commission.
              </p>
            </div>

            {/* Step 4 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                4. Fill Out the Booking Form
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                Complete the booking form with your{" "}
                <span className="[font-family:'Khula',Helvetica] font-semibold">
                  name, email, and any relevant project details
                </span>{" "}
                the artist may need.
              </p>
            </div>

            {/* Step 5 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                5. Confirm Your Request
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                Review all the information provided and click{" "}
                <span className="[font-family:'Khula',Helvetica] font-semibold">"Confirm"</span> to submit your
                booking request.
              </p>
            </div>

            {/* Step 6 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                6. Wait for a Notification
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed">
                You will receive a notification and an email once your request is
                reviewed and accepted by the artist.
              </p>
            </div>

            <div className="bg-white h-[1px] w-full mt-8"></div>

            {/* Final Note */}
            <p className="[font-family:'Khula',Helvetica] text-[10px] sm:text-xs md:text-sm lg:text-base text-white text-center mt-8 px-4 leading-relaxed">
              Once the <span className="[font-family:'Khula',Helvetica] font-semibold">artist</span> accepts your{" "}
              <span className="[font-family:'Khula',Helvetica] font-semibold">booking request</span>, you can proceed
              to <span className="[font-family:'Khula',Helvetica] font-semibold">finalize the commission details</span>{" "}
              and make <span className="[font-family:'Khula',Helvetica] font-semibold">arrangements</span> for the
              work to <span className="[font-family:'Khula',Helvetica] font-semibold">begin!</span>
            </p>

            <div className="bg-white h-[1px] w-full mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToBookAnArtist;

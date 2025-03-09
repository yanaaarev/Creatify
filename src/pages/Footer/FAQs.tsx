import { useReducer } from "react";
import untitled11 from "@assets/authp.png";

// DropdownFaqs Component
interface Props {
  FAQS: boolean;
  text: string;
  children: React.ReactNode;
}

const DropdownFaqs = ({ FAQS, text, children }: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, { FAQS });

  return (
    <div
      className={`w-full max-w-[900px] flex flex-col items-start gap-5 shadow-[-4px_4px_40px_#00000040] p-[30px] rounded-[30px] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] backdrop-blur-[20px] backdrop-brightness-[100%] ${
        state.FAQS ? "bg-[#7db23a]" : "bg-[#7db23a40]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between w-full cursor-pointer"
        onClick={() => dispatch("toggle")}
      >
        <div className="flex-1 font-semibold text-white text-base md:text-lg">
          {text}
        </div>
        <div
          className={`transform ${
            state.FAQS ? "rotate-45" : "rotate-0"
          } transition-transform duration-300 text-white text-xl md:text-2xl`}
        >
          +
        </div>
      </div>

      {/* Content */}
      {state.FAQS && (
        <div className="w-full text-white text-sm md:text-base leading-relaxed mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

function reducer(state: any, action: string) {
  if (action === "toggle") {
    return { FAQS: !state.FAQS };
  }
  return state;
}

// Main FAQs Component
export const FAQs = (): JSX.Element => {
  return (
    <div className="bg-[#191919] flex flex-col items-center w-full min-h-screen relative px-6 md:px-12 lg:px-20 py-12">
      {/* Background Image */}
<div
  className="absolute inset-0 bg-no-repeat bg-top bg-[length:100%_auto]"
  style={{
    backgroundImage: `url(${untitled11})`,
    backgroundColor: "#191919", // Blend with the page background
  }}
></div>


      {/* FAQ Container */}
      <div className="relative w-full max-w-[900px] z-10 space-y-12 mt-[100px]">
        {/* Header */}
        <h1 className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-xl lg:text-2xl text-center mb-4">
          Creatify FAQs
        </h1>

        {/* Dropdown FAQs */}
        <div className="[font-family:'Khula',Helvetica] space-y-6">
          <DropdownFaqs FAQS={false} text="What is Creatify?">
          Creatify is a time-based scheduling web app where clients can book their preferred artist for free. It acts as a medium for artists and clients to connect seamlessly, ensuring safe, smooth, and fair transactions while avoiding scams and irregularities.
          </DropdownFaqs>

          <DropdownFaqs FAQS={false} text="What does Creatify promote?">
          We promote local artists by helping them connect with potential clients effortlessly. Our platform allows artists to showcase their work and provides clients with an easy, secure way to commission artists.
          </DropdownFaqs>

          <DropdownFaqs FAQS={false} text="Why did you start this project?">
          We wanted to create a dedicated platform to promote local artists and help them find clients. Since there is no locally developed web app with a time-based scheduling system for artists, we aimed to be the first to fill that gap while supporting the artist community.
          </DropdownFaqs>

        <DropdownFaqs FAQS={false} text="What advantages does Creatify offer to both clients and artists?">
        Creatify offers a <span className="font-bold text-sm text-white">secure and seamless</span> platform for both clients and artists! It provides a safe alternative to commissioning art via social media, ensuring trust and protection for both parties. Artists gain exposure and access to more clients, while clients can easily find diverse and talented artists. Creatify promotes fairness by offering equal visibility to all artists, making it a reliable platform for discovering unique artwork.
        </DropdownFaqs>

        <DropdownFaqs FAQS={false} text="How can we support the web app?">
        You can support us by becoming a sponsor with any amount! As a token of gratitude, we’ll credit you and create a personalized avatar just for you. Your support helps us improve the platform and grow as we navigate this new field.
        </DropdownFaqs>

        <DropdownFaqs FAQS={false} text="Why do you need the extra charge?">
      As an independent creator of a web app like Creatify, we need additional funds to support the growth of our community, maintain the platform, and ensure its continuous expansion. By making Creatify profitable, we aim to show that it’s possible to do the right thing while still sustaining the platform financially.
      </DropdownFaqs>

      <DropdownFaqs FAQS={false} text="How do I know I won’t get scammed?">
    Creatify implements a 50-50% payment structure: clients pay 50% before the artist begins work, and the remaining 50% is due before the final work is delivered. We thoroughly screen all artists to ensure they meet our standards. In case of issues, we have their personal information on file to hold them accountable. Clients can report problems to our support email for assistance.
    </DropdownFaqs>

        </div>

        {/* Booking and Commission FAQs Section */}
        <h1 className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-xl lg:text-2xl text-center mt-12 mb-[35px]">
  Booking and Commission FAQs
</h1>

<h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white">
  Booking an Artist
</h2>
        <div className="[font-family:'Khula',Helvetica] space-y-6">
          <DropdownFaqs FAQS={false} text="How do I book an artist?">
          <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Clients:</span> Choose an artist based on their style and specialties, check their availability on their profile, and submit your booking request. Booking is free and secures the artist’s time, but no payment is required until the work begins. <br></br><br></br>
          <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Artists:</span> Keep your profile updated with availability and respond promptly to booking requests.
          </DropdownFaqs>

          <DropdownFaqs FAQS={false} text="Can I contact the artist directly?">
          No, direct contact is not allowed. Artists will reach out to clients once the booking is confirmed and the down payment is made.
          </DropdownFaqs>

        {/* Pricing and Payment Section */}
        <h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Pricing and Payment
</h2>

          <DropdownFaqs FAQS={false} text="How are the rates determined?">
          Rates are set by individual artists and confirmed directly after booking.
          </DropdownFaqs>

          <DropdownFaqs FAQS={false} text="Is there a platform fee?">
          Yes, a platform fee applies: <br></br> <br></br>
          • 3% for commissions below ₱5,000 <br></br>
          • 6.5% for commissions ₱6,000 and above

</DropdownFaqs>

<DropdownFaqs FAQS={false} text="When do i make the payment?">
Clients make a 50% down payment to start the work, with the remaining 50% due before the final commission is delivered. Artists receive their full payment promptly after the client's payment is confirmed, as the platform fee is paid by the client. Payments are processed through Creatify's bank account or e-wallet. Once the platform fee is deducted from the client's payment, the artist's full payment is immediately transferred.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="What am I paying for when I book an artist?">
Booking only secures the artist’s time and slot for free. Payment for the completed work occurs after the commission is finished.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="What if my client doesn’t want to pay extra?">
Paying a little more won’t hurt! The platform fee supports the development and maintenance of the web app, ensuring it stays operational and continues to support local artists. Other websites charge 3-6.5% platform fees and take up to 20% from creators’ pay. Supporting our local platform is a small gesture with a big impact!
</DropdownFaqs>


        </div>
 {/* Cancellation and Modifications */}
 <h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Cancellation and Modifications
</h2>
        <DropdownFaqs FAQS={false} text="Can bookings or dates be adjusted or canceled?">
        <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Clients:</span>You can cancel within 24 hours before the artist accepts your request without charges. After this, the artist’s terms apply. Adjusting booked dates is possible but requires direct negotiation with the artist. <br></br><br></br>
        <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Artists:</span>You can decline commission requests or set your own cancellation policies for accepted projects.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="What happens if I cancel after paying the down payment?">
<span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Clients:</span>Down payments are non-refundable as the artist may have already started the work.<br></br><br></br>
<span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Artists:</span>Your terms apply for cancellations after work has started.
</DropdownFaqs>

{/* Communication and Disputes */}
<h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Communication and Disputes
</h2>

<DropdownFaqs FAQS={false} text="How do I know if an artist is right for my project?">
<span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Clients:</span> Review the artist’s profile for their style, genre, and past work. For specific questions, wait for the artist to contact you after confirming your booking.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="What if there is a dispute?">
Both clients and artists are encouraged to resolve disputes through clear communication and written agreements. Creatify does not mediate disputes but facilitates initial connections.
</DropdownFaqs>

{/* Deliverables and Remote Work */}
<h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Deliverables and Remote Work
</h2>

<DropdownFaqs FAQS={false} text="How are deliverables shared?">
Deliverables are sent via Google Drive or another agreed platform. Both parties should ensure privacy and security during the process.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="Are there special conditions for remote or on-location work?">
Additional costs like travel expenses or equipment fees must be discussed and agreed upon between clients and artists.
</DropdownFaqs>

{/* Availability and Scheduling */}
<h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Availability and Scheduling
</h2>

<DropdownFaqs FAQS={false} text="What is the booking notice period?">
Artists can set a notice period (e.g., 3 days). Clients can only book starting from the 4th day onward in such cases.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="Why are there minimum and maximum days for commission dates?">
Artists have control over their schedules and may want to accommodate other clients. The minimum and maximum days help prevent double bookings, ensuring artists can manage their time effectively and responsibly.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="Is there advance booking for artists?">
Artists set their own scheduling terms and may accept advanced bookings. However, automatic cancellations may apply if the booking is too far in advance for them to confirm.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="What happens in case of double bookings?">
Artists are responsible for managing their schedules to avoid overlaps. Creatify encourages careful schedule management.
</DropdownFaqs>

{/* Rights and Ownership */}
<h2 className="[font-family:'Khula',Helvetica] text-subtitle-md font-subtitle-regular leading-subtitle text-white mb-3">
  Rights and Ownership
</h2>

<DropdownFaqs FAQS={false} text="Who owns the rights to the commissioned work?">
Intellectual property rights remain with the artist unless agreed otherwise in writing. Clients are granted a license to use the work for its intended purpose.
</DropdownFaqs>

<DropdownFaqs FAQS={false} text="Why are there minimum and maximum days for commission dates?">
  Artists have control over their schedules and may want to accommodate other clients. The minimum and maximum days help prevent double bookings, ensuring artists can manage their time effectively and responsibly.
</DropdownFaqs>

        {/* General Terms */}
        <h1 className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-xl lg:text-2xl text-center mt-12 mb-4">
          General Terms
        </h1>

        <div className="[font-family:'Khula',Helvetica] space-y-6">
          <DropdownFaqs FAQS={false} text="Changes to Commission or Project">
          Once a commission request is submitted, the scope of work is fixed. Any changes should be discussed with the artist.
          </DropdownFaqs>

          <DropdownFaqs FAQS={false} text="Cancellation after Payment">
          Once the down payment is made, cancellations are non-refundable. The artist has already committed time and resources to the project.
          </DropdownFaqs>

          <p className="[font-family:'Khula',Helvetica] text-[10px] sm:text-xs md:text-sm lg:text-base text-white text-center mt-8 px-4">
  For any issues or further assistance, please reach out to our support team at{" "} <br></br>
  <a
    href="mailto:ask.creatify@gmail.com"
    className="[font-family:'Khula',Helvetica] font-bold underline"
  >
    ask.creatify@gmail.com
  </a>
  .
</p>


        </div>
      </div>
    </div>
  );
};

export default FAQs;

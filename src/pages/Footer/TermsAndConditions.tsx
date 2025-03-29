import { useReducer } from "react";
import untitled11 from "/images/authp.png"; // Adjust the path as needed

interface DropdownProps {
  FAQS: boolean;
  className: string;
  text: string;
  children: React.ReactNode;
}

const DropdownTerms = ({
  FAQS,
  className,
  text,
  children,
}: DropdownProps): JSX.Element => {
  const [state, dispatch] = useReducer(
    (currentState: boolean) => !currentState,
    FAQS
  );

  return (
    <div
      className={`w-full max-w-[900px] p-6 shadow-[-4px_4px_40px_#00000040] rounded-[30px] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] backdrop-blur-[20px] backdrop-brightness-[100%] relative ${
        state ? "bg-[#7db23a]" : "bg-[#7db23a40]"
      } ${className}`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => dispatch()}
      >
        <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white">
          {text}
        </h2>
        <span
          className={`transition-transform ${
            state ? "rotate-45" : "rotate-0"
          } text-white text-xl`}
        >
          +
        </span>
      </div>

      {state && (
        <div className="mt-4 text-xs md:text-sm text-white leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const TermsAndConditions = (): JSX.Element => {
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
      Creatify Terms of Service
    </h1>
    <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed mb-8">
      Welcome to <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Creatify</span>, a web application connecting clients with talented
      artists for commissioned work. <br /> By accessing or using our services, you
      agree to these terms. <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Please read them carefully before proceeding.</span>
    </p>


        {/* Dropdowns */}
        <div className="flex flex-col gap-6 items-center text-left">
          <DropdownTerms FAQS={false} className="" text="Booking and Commission Process">
          Users can browse artist profiles to find a suitable match based on style and specialties. Artists set their own terms and rates for commissions, which are displayed on their profiles and are negotiable based on the client’s requirements.<br></br><br></br> To initiate a commission, clients should check the artist’s availability via their calendar, which displays available and occupied dates, and follow the booking instructions to submit a request. Booking submissions include a non-negotiable range for the commission price, which the artist may adjust during discussions.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Payments and Fees">
          Payments are facilitated through Creatify for security and transparency. <span className="font-semibold"> Instead of a percentage-based platform fee, a fixed ₱50 platform fee is applied only when an invoice is sent, ensuring a seamless transaction.</span> This is the only amount charged outside of the commission price. The payment structure requires a <span className="font-semibold">50% down payment</span> upon finalizing details before work begins, with the remaining 50% due upon delivery of the completed commission.<br></br><br></br>  Proof of payment will be provided to both parties once Creatify receives the funds. Full payment must be made before receiving the final artwork. Artists will not begin work until the down payment is confirmed. <span className="font-semibold">Creatify acts as a payment intermediary but does not take a cut from the artist’s commission.</span>
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Scheduling and Availability">
          Artists can freely update their calendars, adjusting their availability as needed. They are responsible for managing their schedules to avoid overlaps or double bookings. In case of double bookings, it is the artist’s decision whether to accept or decline. Creatify will not be held accountable for scheduling conflicts.<br></br><br></br> Artists may set a booking notice period to prepare for commissions. For example, if today is January 1 and the artist has a 3-day booking notice, the earliest available booking date is January 4. Non-clickable dates will indicate unavailable slots.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Cancellation Policy">
          Clients can cancel a booking request within 24 hours before the artist accepts it without any obligation. Once the artist begins work, down payments are non-refundable. Clients must take responsibility for their bookings. Artists must inform clients of this policy during negotiations.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Communication">
          All discussions and negotiations regarding the commission occur within Creatify's in-app messaging system. Any contracts, payment requests, or confirmations are recorded within the conversation. Outside communications (e.g., social media or direct messaging) are discouraged for Creatify-related processes. Artists must notify clients of any changes to the project timeline or deliverables promptly.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Intellectual Property">
          The artist retains intellectual property rights unless explicitly agreed otherwise. Clients receive a license to use the commissioned work for its intended purpose.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Contracts & Agreements">
          Creatify has a <span className="font-semibold">contract with verified Creatify Artists</span> to ensure professionalism, security, and smooth transactions. Clients, upon proceeding with a booking, <span className="font-semibold">agree to the platform’s Terms of Service</span> as part of their commitment to fair and respectful engagement.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Reporting Issues">
            Any disputes or concerns can be reported to Creatify’s support team
            for assistance.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Nature of the Booking">
          Creatify serves as a platform to book the artist’s time. It is not directly responsible for the commission or its outcome. Clients and artists handle commission details, while Creatify oversees payment facilitation and scheduling.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Liability">
          Creatify is not liable for disputes, damages, or issues arising from the commissioned work. Both parties must resolve disputes directly but can seek Creatify’s support for mediation.
          </DropdownTerms>

          <DropdownTerms FAQS={false} className="" text="Modifications to Terms">
          Creatify reserves the right to modify terms and conditions. Updates take effect immediately upon posting on the website. Continued use of the platform constitutes acceptance of these changes.
          </DropdownTerms>

          <p className="[font-family:'Khula',Helvetica] text-[15px] text-white text-center mt-8 px-4 leading-relaxed">
  For inquiries or support, contact us at{" "} 
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
    </div>
  );
};

export default TermsAndConditions;

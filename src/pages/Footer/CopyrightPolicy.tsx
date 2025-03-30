import { useReducer } from "react";
import untitled11 from "/images/authp.webp"; // Adjust the path as needed

interface DropdownProps {
  FAQS: boolean;
  className: string;
  text: string;
  children: React.ReactNode;
}

const DropdownCopyright = ({
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
        <h2 className="text-base md:text-lg font-semibold text-white">
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

export const CopyrightPolicy = (): JSX.Element => {
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
        Copyright Policy
    </h1>
    <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-relaxed mb-8">
    This Copyright Policy outlines the ownership, use, and rights associated with content created through and submitted to <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">Creatify.</span> By using our platform, <span className="[font-family:'Khula',Helvetica] font-bold text-sm text-white">you agree to comply with this policy.</span>
    </p>


        {/* Dropdowns */}
        <div className="flex flex-col gap-6 items-center text-left [font-family:'Khula',Helvetica] font-normal">
          <DropdownCopyright FAQS={false} className="" text="Ownership of Commissioned Works">
          1. The intellectual property rights of all commissioned works remain with the artist unless otherwise agreed upon in writing. <br></br>
         2. Clients are granted a limited license to use the commissioned work for the purpose agreed upon during the booking. This license does not transfer ownership of the work unless explicitly stated in writing.

          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Use of Commissioned Works">
          1. Clients may not modify, reproduce, or redistribute the commissioned work beyond the intended purpose without prior permission from the artist. <br></br>
          2. Any additional usage rights or modifications must be negotiated and documented in a separate agreement between the client and the artist.

          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Content Submitted to Creatify">
          1. By submitting content (e.g., portfolios, sample works, or other creative materials) to Creatify, artists affirm they hold the rights to the content or have obtained necessary permissions to use it. <br></br>
2. Creatify may display submitted content on the platform for promotional purposes. Artists can request the removal of specific content from the platform at any time by contacting Creatify support.
          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Prohibited Activities">
         1. Unauthorized use, reproduction, or distribution of an artist's work without proper consent is strictly prohibited and may result in legal action.<br></br>
         2. Any attempts to claim ownership of or resell an artist’s work without their permission is a violation of this policy and will be considered a breach of terms.
          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Platform Responsibilities">
          1. Creatify acts solely as a facilitator between clients and artists and does not claim ownership of any work created through commissions. <br></br>
        2. While Creatify promotes a secure and transparent process, it is not responsible for copyright disputes between clients and artists. Clients and artists are responsible for resolving such disputes directly.
          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Reporting Infringement">
          If you believe your work has been used without authorization, please contact us at{" "} 
  <a
    href="mailto:ask.creatify@gmail.com"
    className="[font-family:'Khula',Helvetica] font-normal underline"
  >
    ask.creatify@gmail.com
  </a> with details of the infringement. We will investigate and take appropriate action in compliance with applicable copyright laws.
          </DropdownCopyright>

          <DropdownCopyright FAQS={false} className="" text="Amendments to the Policy">
          Creatify reserves the right to update this Copyright Policy at any time. Changes will be effective immediately upon posting on the platform. Continued use of our services constitutes acceptance of the updated policy.
          </DropdownCopyright>

          <p className="[font-family:'Khula',Helvetica] text-[15px] text-white text-center mt-8 px-4 leading-relaxed">
          For any questions or concerns about this policy, please contact us at{" "} 
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

export default CopyrightPolicy;

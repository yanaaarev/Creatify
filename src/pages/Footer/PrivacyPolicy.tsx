import untitled11 from "/images/authp.png"; // Adjust the path as needed

export const PrivacyPolicy = (): JSX.Element => {
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
          <h1 className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-xl lg:text-2xl mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs md:text-sm text-gray-200 mb-6">
      Last modified: February 25, 2025
    </p>
          {/* Containers */}
          <div className="flex flex-col gap-6 items-center text-left">
            {/* Step 1 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica]text-base md:text-lg font-semibold text-white mb-4">
              1. Introduction
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              Creatify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your information while ensuring a secure and seamless experience on our platform.
              </p>
            </div>

            {/* Step 2 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
              2. Information We Collect
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              We only collect minimal data necessary for account security, booking requests, and payment verification.<br></br><br></br> This includes: <br></br><br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">Account Information:</span> Users can sign up using either: <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;◦ <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">Google Account</span> (OAuth authentication) <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;◦ <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">Email and Password</span> with an <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">email verification</span> for added security <br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">Booking Request:</span> Only <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">email</span> and <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">phone number</span> are required for client-artist communication. <br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">In-App Messaging:</span> No personal data is collected or stored—conversations remain private within the platform.<br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">Payment Confirmation:</span> We do <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">not</span> collect or store bank details or digital wallet information. Instead, we only require a <span className="[font-family:'Khula',Helvetica] font-semibold text-sm text-white">proof of payment</span> (e.g., receipt or transaction screenshot) to confirm payments.
              </p>
            </div>

            {/* Step 3 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
              3. How We Use Your Information
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              We use the collected information for the following purposes:<br></br><br></br>
              • To <span className="[font-family:'Khula',Helvetica] font-semibold">securely</span> create and manage user accounts.<br></br>
              • To facilitate bookings and communication between clients and artists. <br></br>
              • To confirm payments through proof of payment, without storing any banking details.
              </p>
            </div>

            {/* Step 4 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                4. Data Protection & Security
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              • <span className="[font-family:'Khula',Helvetica] font-semibold">Account Security:</span> We implement an <span className="[font-family:'Khula',Helvetica] font-semibold">email verification</span> for email-based sign-ins. <br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold">Messaging Privacy:</span> In-app messages are protected and do not require personal details. <br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold">Payment Safety:</span> We do <span className="[font-family:'Khula',Helvetica] font-semibold">not</span> store or process bank transactions directly, ensuring financial security. <br></br>
              • <span className="[font-family:'Khula',Helvetica] font-semibold">No Third-Party Data Sharing:</span> We never sell or share your personal data with third parties.
              </p>
            </div>

            {/* Step 5 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                5. User Rights & Control
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              • You can update or delete your account at any time.<br></br>
              • You may request the removal of booking details from our records.

              </p>
            </div>

            {/* Step 6 */}
            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                6. Policy Updates
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated effective date.
              </p>
            </div>

            <div className="w-full bg-[#7db23ab3] rounded-[30px] p-6 shadow-[-4px_4px_40px_#00000040]">
              <h2 className="[font-family:'Khula',Helvetica] text-base md:text-lg font-semibold text-white mb-4">
                7. Contact Us
              </h2>
              <div className="bg-[#C3C3C3] h-[0.5px] w-full mb-6"></div>
              <p className="[font-family:'Khula',Helvetica] text-xs md:text-sm text-white leading-loose">
              For any privacy-related concerns, contact us at{" "} 
  <a
    href="mailto:ask.creatify@gmail.com"
    className="[font-family:'Khula',Helvetica] font-semibold underline"
  >
    ask.creatify@gmail.com
  </a>
  .
</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

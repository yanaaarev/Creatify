import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const Footer = (): JSX.Element => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-[1536px] mx-auto px-8 md:px-16 py-6">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Section 1 */}
          <div>
            <p
              onClick={() => handleNavigate("/about-us")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer mb-2"
            >
              About Us
            </p>
            <p
              onClick={() => handleNavigate("/faqs")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer mb-2"
            >
              FAQs
            </p>
            <p
              onClick={() => handleNavigate("/terms-and-conditions")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer"
            >
              Terms and Conditions
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <p
              onClick={() => handleNavigate("/how-to-book-an-artist")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer mb-2"
            >
              How to Book an Artist
            </p>
            <p
              onClick={() => handleNavigate("/copyright-policy")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer mb-2"
            >
              Copyright Policy
            </p>
            <p
              onClick={() => handleNavigate("/privacy-policy")}
              className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base cursor-pointer"
            >
              Privacy Policy
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <p className="[font-family:'Khula',Helvetica] font-semibold text-[#1e1e1e] text-sm md:text-base mb-2">
              Contact Us:
            </p>
            <a
              href="mailto:ask.creatify@gmail.com"
              className="text-sm md:text-base [font-family:'Khula',Helvetica] font-normal underline text-[#1e1e1e] block mb-2"
            >
              ask.creatify@gmail.com
            </a>
            <div className="flex gap-4 mt-2">
              <a href="https://www.facebook.com/creatifyph" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="text-[#1e1e1e] text-lg cursor-pointer" aria-label="Facebook" />
              </a>
              <a href="https://www.instagram.com/creatifyph/" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-[#1e1e1e] text-xl cursor-pointer" aria-label="Instagram" />
              </a>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-[1px] bg-[#c4c4c4] mt-6"></div>

        {/* Copyright Text */}
        <p className="text-center text-xs md:text-sm text-[#1e1e1e] mt-4">
          © {new Date().getFullYear()} Creatify. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;

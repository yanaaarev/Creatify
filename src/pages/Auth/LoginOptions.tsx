import { useNavigate } from "react-router-dom";
import { IoChevronBackCircleOutline } from "react-icons/io5";

export const LoginOptions = (): JSX.Element => {
  const navigate = useNavigate(); // React Router navigation hook

  const handleNavigate = (path: string) => {
    navigate(path);
    setTimeout(() => {
      window.location.reload(); // ✅ Ensures page reload
    }, 0); // Small delay to prevent unnecessary fast triggers
  };

  return (
    <div className="bg-[#191919] flex justify-center items-center w-full min-h-screen">
      {/* Background Image (Full Screen Cover) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/authp.png')" }}
      ></div>

      {/* Login Options Container */}
      <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-[300px] px-10 flex flex-col items-center gap-3 md:py-16 md:px-10 md:gap-3">
        
        {/* Back Button */}
                  <div className="flex justify-start w-full md:pt-0">
                    <IoChevronBackCircleOutline
                      className="text-[#6d7167] w-[35px] h-[35px] md:w-[40px] md:h-[40px] cursor-pointer mb-2 md:mb-5"
                      onClick={() => handleNavigate("/")}
                    />
                  </div>

        {/* Client Login Button */}
        <button
          onClick={() => handleNavigate("/client-login")}
          className="w-full max-w-[100%] md:max-w-[100%] bg-[#7db23a] rounded-[30px] py-3 md:py-4 flex justify-center items-center"
        >
          <span className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-2xl tracking-[0] leading-[normal]">
            Client Sign in
          </span>
        </button>

        {/* Artist Login Button */}
        <button
          onClick={() => handleNavigate("/artist-login")}
          className="w-full max-w-[100%] md:max-w-[100%] border border-solid border-[#7db23a] rounded-[30px] py-3 md:py-4 flex justify-center items-center"
        >
          <span className="[font-family:'Khula',Helvetica] font-semibold text-[#7db23a] text-lg md:text-2xl tracking-[0] leading-[normal]">
            Artist Sign in
          </span>
        </button>

      </div>
    </div>
  );
};

export default LoginOptions;

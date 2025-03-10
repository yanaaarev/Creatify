import { useNavigate } from "react-router-dom";

export const LoginOptions = (): JSX.Element => {
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <div className="bg-[#191919] flex justify-center items-center w-full min-h-screen">
      {/* Background Image (Full Screen Cover) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/authp.png')" }}
      ></div>

      {/* Login Options Container */}
      <div className="relative z-10 w-screen h-screen md:h-auto md:max-w-[540px] bg-white shadow-[-4px_4px_40px_#00000040] rounded-none md:rounded-[30px] py-[350px] px-10 flex flex-col items-center gap-3 md:py-20 md:px-10 md:gap-3">
        
        {/* Client Login Button */}
        <button
          onClick={() => navigate("/client-login")}
          className="w-full max-w-[85%] md:max-w-[413px] bg-[#7db23a] rounded-[30px] py-3 md:py-4 flex justify-center items-center"
        >
          <span className="[font-family:'Khula',Helvetica] font-semibold text-white text-lg md:text-2xl tracking-[0] leading-[normal]">
            Client Login
          </span>
        </button>

        {/* Artist Login Button */}
        <button
          onClick={() => navigate("/artist-login")}
          className="w-full max-w-[85%] md:max-w-[413px] border border-solid border-[#7db23a] rounded-[30px] py-3 md:py-4 flex justify-center items-center"
        >
          <span className="[font-family:'Khula',Helvetica] font-semibold text-[#7db23a] text-lg md:text-2xl tracking-[0] leading-[normal]">
            Artist Login
          </span>
        </button>

      </div>
    </div>
  );
};

export default LoginOptions;

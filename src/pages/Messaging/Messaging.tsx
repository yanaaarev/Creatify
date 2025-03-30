import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../../config/firebaseConfig"; // ✅ Import Firebase Auth
import { IoChevronBackOutline } from "react-icons/io5";
import ChatList from "../../components/ChatList";
import MessageWindow from "../../components/MessageWindow";

const Messaging = () => {
  const { chatId } = useParams(); // ✅ Get chatId from the URL
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const navigate = useNavigate();

// ✅ Function to go back
const goBack = () => {
  setSelectedChat(null);
};

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login-options");
      window.location.reload();
    }
  }, []);

  // ✅ Automatically open the chat if chatId exists in URL
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [chatId]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* ✅ Full-Screen Container */}
      <div className="flex w-full h-full bg-[url('/images/authp.webp')] bg-cover bg-center gap-3 md:gap-6">
        
        {/* ✅ Left Side Chat List (Desktop: Fixed Width, Mobile: Full-Screen Until Chat Selected) */}
        <div className={`w-full md:w-[490px] h-full ${selectedChat ? "hidden" : "block"} md:block`}>
          <ChatList selectChat={setSelectedChat} goBack={goBack} />
        </div>

        {/* ✅ Right Side Messaging Window (Expands on Large Screens, Full-Screen on Mobile When Selected) */}
        <div className={`flex-1 h-full bg-white rounded-none md:rounded-[30px] shadow-md overflow-hidden px-6 py-6 ${selectedChat ? "block" : "hidden"} md:block`}>
          {selectedChat ? (
            <>
              {/* ✅ Back Button for Mobile */}
              <button onClick={goBack} className="md:hidden text-blue-500 text-xl absolute top-3 left-3">
                <IoChevronBackOutline />
              </button>
              <MessageWindow chatId={selectedChat} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;

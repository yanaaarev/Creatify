import { useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore"; // ✅ Import Firestore functions
import { listenForChats } from "../functions/chatFunctions";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Chat {
  id: string;
  clientId?: string;
  artistId?: string;
  clientUsername?: string;
  artistName?: string;
  avatarUrl?: string;
  lastMessage?: string;
  isOnline?: boolean;
  isUnread?: boolean;
}

const ChatList = ({ selectChat, goBack }: { selectChat: (chatId: string) => void; goBack: () => void }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const userId = auth.currentUser?.uid || "";
  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenForChats(userId, setChats);
    return () => unsubscribe();
  }, [userId]);

  // 🔹 Filter Chats Based on Search Query
  const filteredChats = chats.filter((chat) =>
    chat.clientId === userId
      ? chat.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
      : chat.clientUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

   // ✅ Function to go back
   const handleGoBack = () => {
    navigate(-1);
    goBack();
  };

  return (
    <div className="w-full md:w-[500px] h-full md:h-screen bg-white rounded-none md:rounded-[30px] shadow-md p-6 overflow-y-auto relative">
      {/* 🔹 Back Button & Search Bar */}
      <div className="flex items-center gap-2 mb-4 mt-5">
        {/* Back Button */}
        <button onClick={handleGoBack} className="text-gray-600 text-4xl">
          <IoChevronBackCircleOutline />
        </button>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-300 rounded-full px-5 py-2 flex-grow">
          <FaSearch className="text-white mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-white w-full focus:outline-none"
          />
        </div>
      </div>

      {/* 🔹 Chat List */}
      {filteredChats.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No conversations found.</p>
      ) : (
        filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-3 p-3 border-b cursor-pointer transition-all rounded-lg ${
              chat.isUnread ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            onClick={async () => {
              selectChat(chat.id);

              if (chat.isUnread) {
                // ✅ Mark chat as read in Firestore
                const chatRef = doc(db, "chats", chat.id);
                await updateDoc(chatRef, { [`unreadStatus.${userId}`]: false });
              }
            }}
          >
            {/* ✅ Avatar Wrapper with Online Status Indicator */}
            <div className="relative">
              <img
                src={chat.avatarUrl || "/default-avatar.png"}
                alt="User Avatar"
                className="w-[60px] h-[60px] rounded-full object-cover border-5 border-white"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
              />

              {/* 🟢 Online Indicator (Only for Artists) */}
              {chat.artistId && chat.isOnline && (
                <span className="absolute -bottom-[1px] right-[1px] w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* ✅ Display Chat Name with Artist Indicator */}
            <div className="flex flex-col">
              <p className="font-bold text-black text-lg flex items-center gap-2">
                {chat.clientId === userId ? chat.artistName || "Unknown Artist" : chat.clientUsername || "Unknown User"}
                {/* Show "ARTIST" indicator if the user is chatting with an artist */}
                {chat.clientId === userId && (
                  <span className="text-[#7db23a] text-xs font-medium">(ARTIST)</span>
                )}
              </p>

              {/* ✅ Display Last Message */}
              <p className={`text-gray-500 text-sm truncate w-[200px] ${chat.isUnread ? "font-bold" : ""}`}>
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;

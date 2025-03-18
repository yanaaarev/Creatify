import { useState } from "react";
import { sendMessage } from "../functions/chatFunctions";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import uploadToCloudinary from "../functions/uploadtoCloudinary"; // ✅ Import Cloudinary Upload Function

const ChatInput = ({ chatId }: { chatId: string }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // ✅ Handle File Upload & Auto Send
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const attachmentUrl = await uploadToCloudinary(file, "message_attachments");

      // ✅ Automatically send message with the uploaded file
      await sendMessage(chatId, "", attachmentUrl);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("Failed to upload attachment.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle Text Message Sending
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(chatId, newMessage.trim(), undefined);
    setNewMessage("");
  };

  return (
    <div className="flex flex-grow justify-center items-center p-6 w-full md:max-w-[837px] md:w-full h-[50px] bg-gray-200 rounded-full">
      {/* ✅ File Upload Button (Triggers Auto Send) */}
      <button className="text-gray-600 p-1 cursor-pointer" disabled={uploading}>
        <label>
          <FaPaperclip size={20} />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]); // ✅ Auto-send attachment
              }
            }}
          />
        </label>
      </button>

      {/* ✅ Text Input */}
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 p-2 bg-transparent focus:outline-none"
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      />

      {/* ✅ Send Button */}
      <button onClick={handleSendMessage} className="text-blue-600 p-2" disabled={uploading}>
        {uploading ? "Uploading..." : <FaPaperPlane size={20} />}
      </button>
    </div>
  );
};

export default ChatInput;

import { useState } from "react";
import { sendMessage } from "../functions/chatFunctions";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import uploadToCloudinary from "../functions/uploadtoCloudinary"; // ✅ Import Cloudinary Upload Function
import ClipLoader from "react-spinners/ClipLoader";

const ChatInput = ({ chatId }: { chatId: string }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false); // ✅ State for sending indicator

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

  setSending(true); // ✅ Show sending indicator
  try {
    await sendMessage(chatId, newMessage.trim(), undefined);
    setNewMessage(""); // ✅ Reset text area after sending
  } catch (error) {
    console.error("❌ Error sending message:", error);
    alert("Failed to send message.");
  } finally {
    setSending(false); // ✅ Hide sending indicator
  }
};

return (
  <div className="flex items-center w-full px-4 py-2 rounded-full bg-gray-100 border-t border-gray-300">
    {/* ✅ File Upload Button */}
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

    {/* ✅ Textarea for Dynamic Resizing */}
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Start typing..."
      className="flex-1 resize-none bg-transparent border-none focus:outline-none p-2 text-sm"
      rows={1}
      style={{ maxHeight: "150px", overflowY: "auto" }} // ✅ Dynamic height with scroll for long messages
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); // Prevent newline on Enter
          handleSendMessage();
        }
      }}
      disabled={sending} // ✅ Disable input while sending
    />

    {/* ✅ Send Button */}
    <button
      onClick={handleSendMessage}
      className="text-blue-600 p-2"
      disabled={uploading || sending}
    >
      {sending ? <ClipLoader size={20} color="blue" /> : <FaPaperPlane size={20} />}
    </button>
  </div>
  );
};

export default ChatInput;

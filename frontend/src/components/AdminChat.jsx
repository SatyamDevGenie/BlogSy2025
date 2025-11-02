import { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaComments } from "react-icons/fa";

export default function AdminChat({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "admin", text: "Hello 👋 I'm Admin! How can I help you today?" },
  ]);

  const handleSend = () => {
    if (message.trim() === "") return;

    const newMessage = { sender: "user", text: message };
    setMessages([...messages, newMessage]);

    // Add simple auto-reply from admin (static)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "admin",
          text: "Thanks for your message! I'll get back to you shortly. 😊",
        },
      ]);
    }, 1000);

    setMessage("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
      >
        <FaComments className="text-2xl" />
      </button>

      {/* Chat Box */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 w-80 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 font-semibold flex justify-between items-center ${
              darkMode ? "bg-gray-700" : "bg-indigo-600 text-white"
            }`}
          >
            <span>Chat with Admin</span>
            <button
              onClick={() => setOpen(false)}
              className="text-sm hover:opacity-80"
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 h-64">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-sm max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white self-end ml-auto"
                    : darkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className={`flex items-center border-t px-3 py-2 ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className={`flex-1 bg-transparent text-sm outline-none ${
                darkMode ? "placeholder-gray-400" : "placeholder-gray-500"
              }`}
            />
            <button
              onClick={handleSend}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <IoMdSend className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

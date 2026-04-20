import { useState } from "react";
import { Send } from "lucide-react";
import { getSocket } from "../socket/socket";


function MessageInput({ onSend, conversationId }) {
  const [value, setValue] = useState("");
  const [secretMode, setSecretMode] = useState(false);
  const [hiddenText, setHiddenText] = useState("");

  const handleSend = () => {
  if (!value.trim()) return;

  onSend({
    text: value.trim(),
    hidden: hiddenText.trim()
      ? {
          EncryptedPayload: hiddenText, 
          recipientUserIds: [] 
        }
      : null
  });

  setValue("");
  setHiddenText("");
  setSecretMode(false);
};

  const socket = getSocket();

  const handleTyping = (e) => {
    setValue(e.target.value);

    socket.emit("typing", {
      conversationId,
    });


    clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId,
      });
    }, 100);
  };
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-md rounded-2xl px-4 py-2">

        <input
          value={value}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {secretMode && (
          <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
            <input
              value={hiddenText}
              onChange={(e) => setHiddenText(e.target.value)}
              placeholder="Hidden message..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        )}
        <button
          onClick={() => setSecretMode((prev) => !prev)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition
    ${secretMode ? "bg-green-500 text-white" : "bg-white/50"}
  `}
        >
          🔒
        </button>
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-xl text-white flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #059669, #34d399)"
          }}
        >
          <Send size={16} />
        </button>

      </div>
    </div>
  );
}

export default MessageInput;
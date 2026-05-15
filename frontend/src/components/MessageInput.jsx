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
      <div className="flex items-center gap-2 backdrop-blur-md border rounded-2xl px-4 py-2" style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>

        <input
          value={value}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-white/55"
        />
        {secretMode && (
          <div className="mt-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(64, 210, 186, 0.1)', border: '1px solid rgba(64, 210, 186, 0.2)' }}>
            <input
              value={hiddenText}
              onChange={(e) => setHiddenText(e.target.value)}
              placeholder="Hidden message..."
              className="w-full bg-transparent text-xs outline-none text-white placeholder:text-white/55"
            />
          </div>
        )}
        <button
          onClick={() => setSecretMode((prev) => !prev)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition`}
          style={{
            background: secretMode ? "#40D2BA" : "rgba(255, 255, 255, 0.06)",
            border: secretMode ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            color: secretMode ? "#04342C" : "white"
          }}
        >
          🔒
        </button>
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-xl text-[#04342C] flex items-center justify-center"
          style={{
            background: "#40D2BA"
          }}
        >
          <Send size={16} />
        </button>

      </div>
    </div>
  );
}

export default MessageInput;
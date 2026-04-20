import { useState } from "react";
import { Send } from "lucide-react";
import { getSocket } from "../socket/socket";

function MessageInput({ onSend , conversationId }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;

    onSend(value.trim());
    setValue("");
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
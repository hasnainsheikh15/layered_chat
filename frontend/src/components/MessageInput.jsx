import { useState } from "react";
import { Send } from "lucide-react";

function MessageInput({ onSend }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;

    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 glass-panel rounded-2xl px-4 py-2 focus-within:glow-input transition-shadow duration-300">
        
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-xl gradient-sent flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Send size={16} />
        </button>

      </div>
    </div>
  );
}

export default MessageInput;
import { useEffect, useRef } from "react";
import { useState } from "react";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import api from "../api/axios";

function ChatWindow({ conversation }) {
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    // 🔥 auto scroll
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [conversation]);

    useEffect(() => {
  if (!conversation) return;

  const fetchMessages = async () => {
    try {
      const res = await api.get(
        `/messages/${conversation.id}`,
        {
          headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzgyNjBhNy0yYzZjLTQ0YWUtYWEzZS1mNWViM2NjNGE3ZDYiLCJkZXZpY2VJZCI6IjFmYzk4OWVmLTBhNGYtNDhiNS04NGIyLTBhYTM4ZGIyNDgwNyIsImlhdCI6MTc3NjE5ODQzMSwiZXhwIjoxNzc2ODAzMjMxfQ.25NTBAK_r5iJKlXxJViWy_A3IGfMK3bm7N2t5WwRfuo",
          },
        }
      );

      console.log("MESSAGES:", res.data.data);

      setMessages(res.data.data.messages || res.data.data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchMessages();
}, [conversation]);
  
    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation
            </div>
        );
    }
    // console.log("CHAT WINDOW:", conversation);
    return (
        <div className="flex flex-col h-full glass-panel-strong rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                <div className="w-9 h-9 rounded-full gradient-sent flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {conversation.avatar || conversation.name?.charAt(0)}
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        {conversation.name}
                    </h2>

                    {conversation.online && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue neon-dot" />
                            <span className="text-[11px] text-muted-foreground">
                                online
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4"
            >
                {messages.map((msg) => {
  const isMine = msg.senderId === "YOUR_USER_ID";

  return (
    <div
      key={msg.id}
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
          ${
            isMine
              ? "gradient-sent text-primary-foreground"
              : "glass-panel text-foreground"
          }`}
      >
        <p>{msg.visibleText}</p>

        <span className="text-xs opacity-70">
          {msg.createdAt}
        </span>
      </div>
    </div>
  );
})}
            </div>

            {/* Typing Indicator */}
            {conversation.online && <TypingIndicator />}

            {/* Input */}
            <MessageInput
                onSend={async (text) => {
                    try {
                        const res = await api.post("/messages", {
                            conversationId: conversation.id,
                            content: text,
                        },{
                            headers : {
                                Authorization : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzgyNjBhNy0yYzZjLTQ0YWUtYWEzZS1mNWViM2NjNGE3ZDYiLCJkZXZpY2VJZCI6IjFmYzk4OWVmLTBhNGYtNDhiNS04NGIyLTBhYTM4ZGIyNDgwNyIsImlhdCI6MTc3NjE5ODQzMSwiZXhwIjoxNzc2ODAzMjMxfQ.25NTBAK_r5iJKlXxJViWy_A3IGfMK3bm7N2t5WwRfuo"
                            }
                        });

                        const newMessage = res.data.data;

                        setMessages((prev) => [...prev, newMessage]);

                    } catch (err) {
                        console.error(err);
                    }
                }}
            />
        </div>
    );
}

export default ChatWindow;
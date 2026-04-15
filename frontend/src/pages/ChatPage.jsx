import { useEffect, useState } from "react";
import api from "../api/axios";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

function ChatPage() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    // 🔥 dummy data (abhi ke liye)
    //   const conversations = [
    //     {
    //       id: "1",
    //       name: "Tamim",
    //       lastMessage: "Bhai kya scene hai?",
    //       time: "2:30 PM",
    //       unread: 2,
    //       online: true,
    //     },
    //     {
    //       id: "2",
    //       name: "Aman",
    //       lastMessage: "Assignment kar liya?",
    //       time: "1:10 PM",
    //       unread: 0,
    //       online: false,
    //     },
    //   ];
    useEffect(() => {
  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations", {
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzgyNjBhNy0yYzZjLTQ0YWUtYWEzZS1mNWViM2NjNGE3ZDYiLCJkZXZpY2VJZCI6IjFmYzk4OWVmLTBhNGYtNDhiNS04NGIyLTBhYTM4ZGIyNDgwNyIsImlhdCI6MTc3NjE5ODQzMSwiZXhwIjoxNzc2ODAzMjMxfQ.25NTBAK_r5iJKlXxJViWy_A3IGfMK3bm7N2t5WwRfuo",
        },
      });

      const formatted = res.data.data.map((c) => ({
        id: c.id,

        // ✅ name fix
        name: c.type === "direct"
          ? c.otherUser?.username
          : "Group Chat",

        // ✅ last message text
        lastMessage: c.lastMessage?.text || "No messages",

        // ✅ time
        time: c.lastMessage?.createdAt,

        // ✅ unread
        unread: c.unreadCount || 0,

        // optional
        online: true, // temp
      }));

      console.log("FORMATTED:", formatted);

      setConversations(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  fetchConversations();
}, []);
    const handleSelect = (c) => {
        console.log("SELECTED:", c);
        setSelectedConversation(c);
    };
    return (
        <div className="h-screen flex gap-4 p-4 bg-background">

            {/* LEFT SIDE */}
            <div className="w-[30%]">
                <ConversationList
                    conversations={conversations}
                    activeId={selectedConversation?.id}
                    onSelect={handleSelect}
                />
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1">
                <ChatWindow conversation={selectedConversation} />
            </div>

        </div>
    );
}

export default ChatPage;
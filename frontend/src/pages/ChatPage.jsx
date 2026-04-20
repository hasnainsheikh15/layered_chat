import { useEffect, useState } from "react";
import api from "../api/axios";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { connectSocket } from "../socket/socket";

function ChatPage() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");

      const formatted = res.data.data.map((c) => ({
        id: c.id,

        
        name: c.type === "direct"
          ? c.otherUser?.username
          : "Group Chat",

        
        lastMessage: c.lastMessage?.text || "No messages",

        
        time: c.lastMessage?.createdAt,

       
        unread: c.unreadCount || 0,

       
        online: true, 
      }));

      

      setConversations(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  fetchConversations();
}, []);
useEffect(() => {
  const socket = connectSocket();

  if (!socket) return; 

  const handleConnect = () => {
    console.log("Socket connected:", socket.id);
  };

  const handleError = (err) => {
    console.log("Socket Error", err.message);
  };

  // const handleDisconnect = () => {
  //   console.log("Socket disconnected");
  // };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleError);
  // socket.on("disconnect", handleDisconnect);

  
  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleError);
    // socket.off("disconnect", handleDisconnect);
    // socket.disconnect();
  };
}, []);
    const handleSelect = (c) => {
        // console.log("SELECTED:", c);
        setSelectedConversation(c);
    };
   return (
  <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f0f7f0]">

    {/* SAME BACKGROUND AS LOGIN */}
    <div className="absolute inset-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-emerald-200/60 to-green-100/40 blur-[100px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-lime-200/50 to-emerald-100/30 blur-[120px]" />
    </div>

    <div className="relative z-10 w-full max-w-[1400px] h-[90vh] flex gap-4 p-4">

      {/* LEFT */}
      <div className="w-[30%]">
        <ConversationList
          conversations={conversations}
          activeId={selectedConversation?.id}
          onSelect={handleSelect}
        />
      </div>

      {/* RIGHT */}
      <div className="flex-1">
        <ChatWindow conversation={selectedConversation} />
      </div>

    </div>
  </div>
);
}

export default ChatPage;
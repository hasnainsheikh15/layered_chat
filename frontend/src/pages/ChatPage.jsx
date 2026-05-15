import { useEffect, useState } from "react";
import api from "../api/axios";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { connectSocket } from "../socket/socket";
import { useAuth } from "../context/AuthContext.jsx";
import { Settings2, X } from "lucide-react";
import LayerSettings from "../components/LayerSettings";

function ChatPage() {

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const { user } = useAuth();

  useEffect(() => {

    const fetchConversations = async () => {

      try {

        const res =
          await api.get("/conversations");

        const formatted =
          res.data.data.map((c) => ({

            id: c.id,

            name:
              c.type === "direct"
                ? c.otherUser?.username
                : "Group Chat",

            lastMessage:
              c.lastMessage?.text ||
              "No messages",

            time:
              c.lastMessage?.createdAt,

            unread:
              c.unreadCount || 0,

            online: true,

            lastActivity:
              c.lastMessage?.createdAt

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
      console.log(
        "Socket connected:",
        socket.id
      );
    };

    const handleError = (err) => {
      console.log(
        "Socket Error",
        err.message
      );
    };

    const handleUnreadUpdate = ({
      conversationId,
      unreadCount
    }) => {

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              unread: unreadCount
            }
            : c
        )
      );

    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleError
    );

    socket.on(
      "unreadUpdate",
      handleUnreadUpdate
    );

    return () => {

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleError
      );

      socket.off(
        "unreadUpdate",
        handleUnreadUpdate
      );

    };

  }, []);

  const handleSelect = (c) => {

    setSelectedConversation(c);

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === c.id
          ? {
            ...conv,
            unread: 0
          }
          : conv
      )
    );

  };

  useEffect(() => {

    const socket = connectSocket();

    if (!socket) return;

    const handleNewMessage = (data) => {

      const msg = data.message;

      setConversations((prev) => {

        const updated =
          prev.map((c) => {

            if (
              c.id !== msg.conversationId
            ) {
              return c;
            }

            const isActive =
              selectedConversation?.id === c.id;

            return {

              ...c,

              lastMessage:
                msg.visibleText,

              time:
                msg.createdAt,

              lastActivity:
                msg.createdAt,

              unread: isActive
                ? 0
                : c.unread

            };

          });

        return [

          updated.find(
            (c) =>
              c.id ===
              msg.conversationId
          ),

          ...updated.filter(
            (c) =>
              c.id !==
              msg.conversationId
          )

        ];

      });

    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {

      socket.off(
        "newMessage",
        handleNewMessage
      );

    };

  }, [selectedConversation]);

  return (

    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #071510 0%, #0b1e17 40%, #071510 100%)' }}>

      {/* settings modal */}
      {showSettings && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">

          <div className="relative w-[380px]">

            {/* close */}
            <button

              onClick={() =>
                setShowSettings(false)
              }

              className="absolute -top-3 -right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center border"

              style={{
                background:
                  "rgba(13, 35, 24, 0.95)",

                borderColor:
                  "rgba(64, 210, 186, 0.15)"
              }}
            >

              <X
                size={16}
                className="text-white/70"
              />

            </button>

            <LayerSettings />

          </div>

        </div>

      )}

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(64,210,186,0.13), transparent)',
        pointerEvents: 'none'
      }} />

      {/* floating settings */}
      <button

        onClick={() =>
          setShowSettings(true)
        }

        className="fixed top-5 right-5 z-50 w-11 h-11 rounded-2xl flex items-center justify-center border backdrop-blur-xl shadow-xl transition-all hover:scale-105"

        style={{
          background:
            "rgba(13, 35, 24, 0.45)",

          borderColor:
            "rgba(64, 210, 186, 0.15)"
        }}
      >

        <Settings2
          size={18}
          className="text-[#40D2BA]"
        />

      </button>

      <div className="relative z-10 w-full max-w-[1400px] h-[90vh] flex gap-4 p-4">

        {/* LEFT */}
        <div className="w-[30%]">

          <ConversationList
            conversations={conversations}
            activeId={
              selectedConversation?.id
            }
            onSelect={handleSelect}
          />

        </div>

        {/* RIGHT */}
        <div className="flex-1">

          <ChatWindow
            conversation={
              selectedConversation
            }
          />

        </div>

      </div>

    </div>

  );

}

export default ChatPage;
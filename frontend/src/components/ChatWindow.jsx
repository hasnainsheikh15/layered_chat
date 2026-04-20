import { useEffect, useRef } from "react";
import { useState } from "react";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import api from "../api/axios";
import { getSocket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";

function ChatWindow({ conversation }) {
    const { user } = useAuth()
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();

        const isToday =
            d.toDateString() === now.toDateString();

        if (isToday) {
            return d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        return d.toLocaleDateString();
    };

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);
    useEffect(() => {
        if (!conversation) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(
                    `/messages/${conversation.id}`
                );

                //   console.log("MESSAGES:", res.data.data);

                // setMessages(res.data.data.messages || res.data.data);
                const fetched = res.data.data.messages || [];
                setMessages(fetched)

            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();
    }, [conversation?.id]);
    useEffect(() => {
        const socket = getSocket();

        if (!socket || !conversation) return;

        const handleNewMessage = (data) => {
            const newMsg = data.message;


            if (newMsg.conversationId !== conversation.id) return;

            setMessages((prev) => [...prev, newMsg]);
        };
        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [conversation]);
    useEffect(() => {
        const socket = getSocket();
        if (!socket || !conversation) return;

        let typingTimeout;

        const handleTyping = ({ conversationId }) => {
            if (conversationId === conversation.id) {
                setIsTyping(true);

                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    setIsTyping(false);
                }, 1500);
            }
        };

        const handleStopTyping = ({ conversationId }) => {
            if (conversationId === conversation.id) {
                setIsTyping(false);
            }
        };

        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);

        return () => {
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
        };
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
        <div className="flex flex-col h-full rounded-3xl p-[1px] bg-gradient-to-br from-green-200/40 to-emerald-300/20 shadow-xl">

            <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/40 bg-white/40 backdrop-blur-md">

                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{
                            background: "linear-gradient(135deg, #059669, #34d399)"
                        }}
                    >
                        {conversation.avatar || conversation.name?.charAt(0)}
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-gray-800">
                            {conversation.name}
                        </h2>

                        {conversation.online && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[11px] text-gray-500">
                                    online
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">

                    {messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
              ${isMine
                                            ? "text-white"
                                            : "bg-white/70 backdrop-blur-md text-gray-800 border border-white/40"
                                        }`}
                                    style={
                                        isMine
                                            ? { background: "linear-gradient(135deg, #059669, #34d399)" }
                                            : {}
                                    }
                                >
                                    <p>{msg.visibleText}</p>

                                    <span className="block text-[10px] mt-1 opacity-70">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isTyping && <TypingIndicator />}

                <MessageInput
                    conversationId={conversation.id}
                    onSend={async (text) => {
                        try {
                            const res = await api.post("/messages", {
                                conversationId: conversation.id,
                                content: text,
                            });

                            const newMessage = res.data.data;
                            setMessages((prev) => [...prev, newMessage]);

                        } catch (err) {
                            console.error(err);
                        }
                    }}
                />

            </div>
        </div>
    );
}

export default ChatWindow;
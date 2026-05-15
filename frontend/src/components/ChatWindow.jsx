import { useEffect, useRef } from "react";
import { useState } from "react";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import api from "../api/axios";
import { getSocket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble.jsx";

function ChatWindow({ conversation }) {
    const { user } = useAuth()
    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [revealedMessages, setRevealedMessages] = useState({});
    const [nextCursor, setNextCursor] = useState(null);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const shouldAutoScrollRef = useRef(true);
    const previousScrollHeightRef = useRef(0);

    const handleReveal = async (msg) => {
        try {
            // already revealed hai?
            if (revealedMessages[msg.id]) return;

            const res = await api.get(`/messages/${msg.id}/unlock`);

            setRevealedMessages((prev) => ({
                ...prev,
                [msg.id]: res.data.data.encrypted
            }));

            setTimeout(() => {
                setRevealedMessages((prev) => {
                    const copy = { ...prev };
                    delete copy[msg.id];
                    return copy;
                });
            }, 10000);

        } catch (err) {
            console.error(err);
        }
    };

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

    const loadOlderMessages = async () => {
        // loadingOlderRef.current = true;
        if (!nextCursor || loadingOlder) return;

        try {

            setLoadingOlder(true);

            const container = scrollRef.current;

            // const oldHeight = container.scrollHeight;
            previousScrollHeightRef.current =
                container.scrollHeight;
            const res = await api.get(
                `/messages/${conversation.id}?cursor=${nextCursor}`
            );

            const data = res.data.data;

            setMessages((prev) => [
                ...data.messages,
                ...prev
            ]);

            setNextCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
            requestAnimationFrame(() => {

                const newHeight = container.scrollHeight;

                container.scrollTop =
                    newHeight - previousScrollHeightRef.current;

            });

            // requestAnimationFrame(() => {

            //     const newHeight = container.scrollHeight;

            //     container.scrollTop += newHeight - oldHeight;

            // });

        } catch (err) {
            console.error(err);
        } finally {
            // loadingOlderRef.current = false;
            setLoadingOlder(false);
        }
    };




    useEffect(() => {

        const container = scrollRef.current;

        if (!container) return;


        if (!shouldAutoScrollRef.current) return;

        requestAnimationFrame(() => {

            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });

        });

    }, [messages]);

    useEffect(() => {
        if (!conversation) return;
        const socket = getSocket();

        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "auto",
        });
        const fetchMessages = async () => {
            try {
                const res = await api.get(
                    `/messages/${conversation.id}`
                );

                console.log("MESSAGES:", res.data);

                // setMessages(res.data.data.messages || res.data.data);
                // const fetched = res.data.data.messages || [];
                const data = res.data.data;

                setMessages(data.messages);
                setNextCursor(data.nextCursor);
                setHasMore(!!data.nextCursor);
                requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "auto",
                    });
                });



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
            console.log("New message received via socket:", data);

            if (!data?.message) return;

            const newMsg = data.message;

            if (newMsg.conversationId !== conversation.id) return;

            setMessages((prev) => {
                const exists = prev.some((m) => m.id === newMsg.id);

                if (exists) return prev;

                return [...prev, newMsg];
            });

            if (newMsg.senderId !== user.id) {
                socket.emit("messageDelivered", {
                    messageId: newMsg.id
                });
            }
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

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !conversation) return;

        const handleMessagesSeen = ({ conversationId, messages: seenMessages, seenByUserId }) => {
            if (conversationId !== conversation.id) return;

            // Update messages with seenAt information
            setMessages((prev) =>
                prev.map((msg) => {
                    const seenMsg = seenMessages.find((m) => m.id === msg.id);
                    if (seenMsg) {
                        return {
                            ...msg,
                            seenAt: seenMsg.seenAt
                        };
                    }
                    return msg;
                })
            );
        };

        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [conversation]);

    useEffect(() => {

        const container = scrollRef.current;
        const socket = getSocket();
        if (!container) return;

        // const handleScroll = () => {

        //     if (
        //         container.scrollTop < 100 &&
        //         hasMore &&
        //         !loadingOlder
        //     ) {
        //         loadOlderMessages();
        //     }
        // };

        const handleScroll = () => {

            // 🔥 user near bottom?
            const nearBottom =
                container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
                150;

            shouldAutoScrollRef.current = nearBottom;

            if (nearBottom && messages.length > 0) {

                const latestMessage =
                    messages[messages.length - 1];


                if (latestMessage.senderId !== user.id) {

                    socket?.emit("messagesSeen", {
                        conversationId: conversation.id
                    });

                }

            }
            // 🔥 load older
            if (
                container.scrollTop < 100 &&
                hasMore &&
                !loadingOlder
            ) {
                loadOlderMessages();
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };

    }, [nextCursor, hasMore, loadingOlder]);

    useEffect(() => {

        const socket = getSocket();

        if (!socket || !conversation) return;

        socket.emit("openConversation", {
            conversationId: conversation.id
        });

        return () => {

            socket.emit("closeConversation");

        };

    }, [conversation?.id]);




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
                {loadingOlder && (
                    <div className="text-center text-xs text-gray-400 py-2">
                        Loading older messages...
                    </div>
                )}

                {/* MESSAGES */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-5 py-4 space-y-2 scrollbar-thin">

                    {messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;

                        return (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                isMine={isMine}
                                revealedMessages={revealedMessages}
                                onReveal={handleReveal}
                                formatTime={formatTime}
                            />
                        );
                    })}
                </div>

                {isTyping && <TypingIndicator />}

                <MessageInput
                    conversationId={conversation.id}
                    onSend={async ({ text, hidden }) => {
                        try {
                            const res = await api.post("/messages", {
                                conversationId: conversation.id,
                                content: text,
                                hidden
                            });

                            const newMessage = res.data.data;
                            // setMessages((prev) => [...prev, newMessage]);

                        } catch (err) {
                            console.log(err.message);
                        }
                    }}
                />

            </div>
        </div>
    );
}

export default ChatWindow;
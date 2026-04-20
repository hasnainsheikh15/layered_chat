function MessageBubble({
    msg,
    isMine,
    revealedMessages,
    onReveal,
    formatTime,
}) {
    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
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

                {/* visible text */}
                <p className="flex items-center gap-1">
                    {msg.visibleText}

                    {isMine && msg.hasHidden && (
                        <span className="text-[10px] opacity-70">🔒</span>
                    )}
                </p>


                {msg.hasHidden && !revealedMessages[msg.id] && (
                    <button
                        onClick={() => {
                            // console.log("clicked")
                            onReveal(msg)
                        }}
                        className="mt-2 h-6 rounded-lg bg-gradient-to-r from-green-200/40 via-green-300/60 to-green-200/40 animate-pulse cursor-pointer backdrop-blur-sm border border-green-200/50 flex items-center justify-center text-[12px] text-green-700 shimmer"
                    >
                        ✨ reveal
                    </button>
                )}

                {/* 🔓 revealed content */}
                {revealedMessages[msg.id] && (
                    <div className="mt-2 text-xs text-gray-700 bg-green-50 px-2 py-1 rounded-md animate-fade-in">
                        {revealedMessages[msg.id]}
                    </div>
                )}

                {/* time */}
                <span className="block text-[10px] mt-1 opacity-70">
                    {formatTime(msg.createdAt)}
                </span>
            </div>
        </div>
    );
}

export default MessageBubble;
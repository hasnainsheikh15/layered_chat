
import { Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
function MessageBubble({
    msg,
    isMine,
    revealedMessages,
    onReveal,
    formatTime,
}) {

    const [offsetX, setOffsetX] = useState(0);
    const [showMeta, setShowMeta] =
        useState(false);
    const popupRef = useRef(null);

    const startX = useRef(0);

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                popupRef.current &&
                !popupRef.current.contains(e.target)
            ) {
                setShowMeta(false);
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);

    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {

        const currentX = e.touches[0].clientX;

        const diff = currentX - startX.current;

        // only left swipe
        if (diff < 0) {
            setOffsetX(Math.max(diff, -80));
        }

    };

    const handleTouchEnd = () => {

        if (offsetX < -40) {
            setOffsetX(-80);
        } else {
            setOffsetX(0);
        }

    };

    const isDragging = useRef(false);

    const handleMouseDown = (e) => {

        isDragging.current = true;

        startX.current = e.clientX;

    };

    const handleMouseMove = (e) => {

        if (!isDragging.current) return;

        const diff = e.clientX - startX.current;

        if (diff < 0) {
            setOffsetX(Math.max(diff, -80));
        }

    };

    const handleMouseUp = () => {

        isDragging.current = false;

        if (offsetX < -40) {
            setOffsetX(-80);
        } else {
            setOffsetX(0);
        }

    };

    return (

        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>

            <div className="relative group max-w-[75%]">

                {/* metadata */}
                {isMine && (
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-3 text-[10px] pointer-events-none" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>

                        <span style={{ fontWeight: 500 }}>
                            Sent • {formatTime(msg.createdAt)}
                        </span>

                        {msg.seenAt && (
                            <span style={{ fontWeight: 500 }}>
                                Opened • {formatTime(msg.seenAt)}
                            </span>
                        )}

                    </div>
                )}

                {/* bubble */}
                <div

                    onTouchStart={handleTouchStart}

                    onTouchMove={handleTouchMove}

                    onTouchEnd={handleTouchEnd}

                    onMouseDown={handleMouseDown}

                    onMouseMove={handleMouseMove}

                    onMouseUp={handleMouseUp}

                    onMouseLeave={handleMouseUp}

                    style={{
                        transform: `translateX(${offsetX}px)`,
                        background: isMine ? "#40D2BA" : "rgba(13, 30, 38, 0.85)",
                        borderColor: isMine ? "transparent" : "rgba(64, 210, 186, 0.15)",
                        backdropFilter: isMine ? "none" : "blur(10px)",
                        WebkitBackdropFilter: isMine ? "none" : "blur(10px)",
                    }}

                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-transform duration-200 border
        ${isMine
                            ? "text-[#04342C]"
                            : "text-white"
                        }`}

                    style={{
                        transform: `translateX(${offsetX}px)`,
                        background: isMine ? "#40D2BA" : "rgba(13, 30, 38, 0.85)",
                        borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        border: isMine ? "none" : "1px solid rgba(64, 210, 186, 0.15)",
                        boxShadow: isMine ? "0 4px 12px rgba(64, 210, 186, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                >

                    {/* visible text */}
                    <p className="flex items-center gap-1">

                        {msg.visibleText}

                    </p>

                    {/* hidden reveal */}
                    {msg.hasHidden &&
                        !isMine &&
                        !revealedMessages[msg.id] && (

                            <button
                                onClick={() => {
                                    onReveal(msg)
                                }}
                                className="mt-2 h-6 rounded-lg animate-pulse cursor-pointer backdrop-blur-sm border flex items-center justify-center text-[12px] px-3"
                                style={{
                                    background: "rgba(64, 210, 186, 0.15)",
                                    borderColor: "rgba(64, 210, 186, 0.3)",
                                    color: "#40D2BA",
                                    fontWeight: 500
                                }}
                            >
                                ✨ reveal
                            </button>

                        )}

                    {/* hidden content */}
                    {revealedMessages[msg.id] && (

                        <div className="mt-2 text-xs px-2 py-1 rounded-md animate-fade-in" style={{ background: 'rgba(64, 210, 186, 0.1)', borderLeft: '2px solid #40D2BA', color: '#FFFFFF' }}>

                            {revealedMessages[msg.id]}

                        </div>

                    )}

                    {/* time */}
                    {/* footer */}
                    <div className="flex items-center justify-end gap-2 mt-1 relative">


                        {/* hover info button */}
                        {isMine && (

                            <button

                                onClick={() =>
                                    setShowMeta(prev => !prev)
                                }

                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"

                            >

                                <Info
                                    size={12}
                                    style={{ color: '#04342C' }}
                                />

                            </button>

                        )}

                        {/* time */}
                        <span className="text-[10px]" style={{ color: isMine ? '#04342C' : 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>

                            {formatTime(msg.createdAt)}

                        </span>

                        {/* metadata popup */}
                        {/* metadata */}
                        {isMine && showMeta && (

                            <div
                                ref={popupRef}
                                className="absolute bottom-0 right-full mr-2 backdrop-blur-md border shadow-lg rounded-xl px-3 py-2 text-[10px] min-w-[140px] z-50 animate-fade-in"
                                style={{ background: 'rgba(13, 30, 38, 0.95)', borderColor: 'rgba(64, 210, 186, 0.3)', color: '#40D2BA', fontWeight: 500 }}
                            >

                                <div>
                                    Sent • {formatTime(msg.createdAt)}
                                </div>

                                {msg.seenAt && (

                                    <div className="mt-1">
                                        Opened • {formatTime(msg.seenAt)}
                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}

export default MessageBubble;
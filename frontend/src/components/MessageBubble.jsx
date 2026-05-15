
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
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-3 text-[10px] text-gray-500 pointer-events-none">

                        <span>
                            Sent • {formatTime(msg.createdAt)}
                        </span>

                        {msg.seenAt && (
                            <span>
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
                        transform: `translateX(${offsetX}px)`
                    }}

                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-transform duration-200
        ${isMine
                            ? "text-white"
                            : "bg-white/70 backdrop-blur-md text-gray-800 border border-white/40"
                        }`}

                    {...(isMine
                        ? {
                            style: {
                                transform: `translateX(${offsetX}px)`,
                                background:
                                    "linear-gradient(135deg, #059669, #34d399)"
                            }
                        }
                        : {
                            style: {
                                transform: `translateX(${offsetX}px)`
                            }
                        })}
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
                                className="mt-2 h-6 rounded-lg bg-gradient-to-r from-green-200/40 via-green-300/60 to-green-200/40 animate-pulse cursor-pointer backdrop-blur-sm border border-green-200/50 flex items-center justify-center text-[12px] text-green-700 shimmer px-3"
                            >
                                ✨ reveal
                            </button>

                        )}

                    {/* hidden content */}
                    {revealedMessages[msg.id] && (

                        <div className="mt-2 text-xs text-gray-700 bg-green-50 px-2 py-1 rounded-md animate-fade-in">

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
                                    className="text-white/70"
                                />

                            </button>

                        )}

                        {/* time */}
                        <span className="text-[10px] opacity-70">

                            {formatTime(msg.createdAt)}

                        </span>

                        {/* metadata popup */}
                        {/* metadata */}
                        {isMine && showMeta && (

                            <div
                                ref={popupRef}
                                className="absolute bottom-0 right-full mr-2 bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-3 py-2 text-[10px] text-gray-700 min-w-[140px] z-50 animate-fade-in"
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
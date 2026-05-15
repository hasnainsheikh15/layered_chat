import { Search } from "lucide-react";
import { formatSentAgo } from "../utils/formatSentAgo";

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

function ConversationList({
  conversations = [],
  activeId,
  onSelect
}) {

  return (

    <aside className="w-full h-full rounded-3xl p-[1px] bg-gradient-to-br from-green-200/40 to-emerald-300/20 shadow-xl">

      <div className="h-full flex flex-col bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">

        {/* HEADER */}
        <div className="px-5 pt-5 pb-3">

          <h1
            className="text-2xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #059669, #34d399)"
            }}
          >
            Layered
          </h1>

        </div>

        {/* SEARCH */}
        <div className="px-4 pb-3">

          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/40">

            <Search
              size={14}
              className="text-gray-400"
            />

            <input
              placeholder="Search"
              className="bg-transparent text-xs outline-none flex-1"
            />

          </div>

        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">

          {conversations.map((c) => (

            <button
              key={c.id}

              onClick={() => onSelect(c)}

              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left

          ${
            c.id === activeId
              ? "bg-white/70 backdrop-blur-md shadow-md"
              : "hover:bg-white/50"
          }`}
            >

              <div className="relative w-11 h-11">

                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #059669, #34d399)"
                  }}
                >
                  {c.name?.charAt(0)}
                </div>

                {c.online && (

                  <span className="absolute bottom-[2px] right-[2px] w-3 h-3 bg-green-500 rounded-full border-2 border-white" />

                )}

              </div>

              <div className="flex-1 min-w-0">

                <div className="flex justify-between">

                  <span className="text-sm font-medium text-gray-800 truncate">

                    {c.name}

                  </span>

                  <span className="text-[11px] text-muted-foreground">

                    {formatSentAgo(c.lastActivity)}

                  </span>

                </div>

                <div className="flex items-center justify-between mt-0.5">

                  <p className="text-xs text-muted-foreground truncate">

                    {c.lastMessage}

                  </p>

                  {c.unread > 0 && (

                    <div className="flex items-center gap-1 ml-2">

                      <span className="w-2 h-2 rounded-full bg-green-500" />

                      <span className="text-[10px] text-green-600 font-medium">

                        {c.unread > 4
                          ? "4+ new"
                          : `${c.unread} new`}

                      </span>

                    </div>

                  )}

                </div>

              </div>

            </button>

          ))}

        </div>

      </div>

    </aside>

  );

}

export default ConversationList;
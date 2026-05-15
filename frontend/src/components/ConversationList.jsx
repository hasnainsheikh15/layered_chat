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

    <aside className="w-full h-full rounded-3xl p-[1px] shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(64, 210, 186, 0.2), rgba(64, 210, 186, 0.1))' }}>

      <div className="h-full flex flex-col backdrop-blur-xl rounded-3xl overflow-hidden border" style={{ background: 'rgba(13, 35, 24, 0.4)', borderColor: 'rgba(64, 210, 186, 0.15)' }}>

        {/* HEADER */}
        <div className="px-5 pt-5 pb-3">

          <h1
            className="text-2xl font-bold text-teal-accent"
            style={{ fontWeight: 700 }}
          >
            Layered
          </h1>

        </div>

        {/* SEARCH */}
        <div className="px-4 pb-3">

          <div className="flex items-center gap-2 backdrop-blur-md rounded-xl px-3 py-2 border" style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>

            <Search
              size={14}
              className="text-white/55"
            />

            <input
              placeholder="Search"
              className="bg-transparent text-xs outline-none flex-1 text-white placeholder:text-white/55"
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
              ? "backdrop-blur-md shadow-md border"
              : "hover:bg-white/10"
          }`}
              style={c.id === activeId ? { background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(64, 210, 186, 0.2)' } : {}}
            >

              <div className="relative w-11 h-11">

                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-sm font-semibold text-[#04342C]"
                  style={{
                    background: "#40D2BA"
                  }}
                >
                  {c.name?.charAt(0)}
                </div>

                {c.online && (

                  <span className="absolute bottom-[2px] right-[2px] w-3 h-3 bg-teal-accent rounded-full border-2 border-[#071510]" />

                )}

              </div>

              <div className="flex-1 min-w-0">

                <div className="flex justify-between">

                  <span className="text-sm font-medium text-white truncate">

                    {c.name}

                  </span>

                  <span className="text-[11px] text-white/55">

                    {formatSentAgo(c.lastActivity)}

                  </span>

                </div>

                <div className="flex items-center justify-between mt-0.5">

                  <p className="text-xs text-white/55 truncate">

                    {c.lastMessage}

                  </p>

                  {c.unread > 0 && (

                    <div className="flex items-center gap-1 ml-2">

                      <span className="w-2 h-2 rounded-full bg-teal-accent" />

                      <span className="text-[10px] text-teal-accent font-medium">

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
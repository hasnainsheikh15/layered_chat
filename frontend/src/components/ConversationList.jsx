import { Search } from "lucide-react";

function ConversationList({ conversations = [], activeId, onSelect }) {
  return (
    <aside className="w-full h-full flex flex-col glass-panel-strong rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1
          className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          Layered
        </h1>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
          <Search size={14} className="text-muted-foreground" />
          <input
            placeholder="Search"
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-1">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group
              ${
                c.id === activeId
                  ? "glass-panel glow-purple"
                  : "hover:bg-secondary/50"
              }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold
                  ${
                    c.id === activeId
                      ? "gradient-sent text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
              >
                {c.avatar || c.name?.charAt(0)}
              </div>

              {c.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-neon-blue neon-dot border-2 border-background" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground truncate">
                  {c.name}
                </span>
                <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                  {c.time}
                </span>
              </div>

              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {c.lastMessage?.text}
              </p>
            </div>

            {/* Unread */}
            {c.unread > 0 && (
              <span className="w-5 h-5 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 glow-purple">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default ConversationList;
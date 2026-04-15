function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 text-muted-foreground text-xs">
      <span>typing</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-neon-purple typing-dot-1" />
        <span className="w-1 h-1 rounded-full bg-neon-purple typing-dot-2" />
        <span className="w-1 h-1 rounded-full bg-neon-purple typing-dot-3" />
      </span>
    </div>
  );
}

export default TypingIndicator;
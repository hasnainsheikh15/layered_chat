function TypingIndicator() {
  return (
    <div className="px-4 py-2 text-xs text-white/55 flex items-center gap-2">
  <span style={{ fontWeight: 500 }}>typing</span>
  <span className="flex gap-1">
    <span className="w-1 h-1 bg-teal-accent rounded-full" style={{ animation: 'bounceStagger 0.6s ease-in-out infinite 0s' }} />
    <span className="w-1 h-1 bg-teal-accent rounded-full" style={{ animation: 'bounceStagger 0.6s ease-in-out infinite 0.2s' }} />
    <span className="w-1 h-1 bg-teal-accent rounded-full" style={{ animation: 'bounceStagger 0.6s ease-in-out infinite 0.4s' }} />
  </span>
</div>
  );
}

export default TypingIndicator;
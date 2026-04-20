function TypingIndicator() {
  return (
    <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
  <span>typing</span>
  <span className="flex gap-1">
    <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce" />
    <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce delay-150" />
    <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce delay-300" />
  </span>
</div>
  );
}

export default TypingIndicator;
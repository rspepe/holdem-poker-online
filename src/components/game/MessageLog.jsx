export default function MessageLog({ messages }) {
  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 h-[724px] w-full overflow-y-auto border-2 border-gray-700">
      <h3 className="text-white font-bold text-lg mb-3 sticky top-0 bg-gray-900 pb-2">Game Log</h3>
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="text-sm text-gray-300 pb-2 border-b border-gray-700 last:border-b-0"
          >
            <span className="text-gray-500 text-xs">[{msg.handNumber}]</span>{' '}
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-8">
            No messages yet
          </div>
        )}
      </div>
    </div>
  );
}

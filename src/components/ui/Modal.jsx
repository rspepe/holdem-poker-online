export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-500">
        {title && (
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {title}
          </h2>
        )}
        <div className="text-white">{children}</div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

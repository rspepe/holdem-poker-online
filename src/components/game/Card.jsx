import { SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from '../../utils/constants';

export default function Card({ card, faceDown = false, className = '' }) {
  if (faceDown) {
    return (
      <div className={`bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg border-2 border-blue-900 w-16 h-24 flex items-center justify-center ${className}`}>
        <div className="text-white text-3xl">
          <div className="rotate-45">★</div>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const rank = RANK_NAMES[card.rank];

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 border-gray-300 w-16 h-24 flex flex-col items-center justify-between p-2 ${className}`}>
      <div className={`text-2xl font-bold ${color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
        {rank}
      </div>
      <div className={`text-4xl ${color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
        {symbol}
      </div>
      <div className={`text-2xl font-bold ${color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
        {rank}
      </div>
    </div>
  );
}

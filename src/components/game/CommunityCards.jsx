import Card from './Card';

export default function CommunityCards({ cards }) {
  return (
    <div className="flex gap-2 justify-center items-center">
      {[0, 1, 2, 3, 4].map(index => (
        <div
          key={index}
          className="transition-all duration-300"
        >
          {cards[index] ? (
            <Card card={cards[index]} />
          ) : (
            <div className="w-16 h-24 border-2 border-dashed border-gray-500 rounded-lg opacity-30" />
          )}
        </div>
      ))}
    </div>
  );
}
